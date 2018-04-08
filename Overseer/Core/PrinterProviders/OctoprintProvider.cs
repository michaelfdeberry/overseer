using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using log4net;
using Newtonsoft.Json.Linq;
using Overseer.Core.Models;
using RestSharp;

namespace Overseer.Core.PrinterProviders
{
    public class OctoprintProvider : PrinterProvider
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(OctoprintProvider));
        string _apiKey;
        string _url;

        public OctoprintProvider(Printer printer)
        {
            PrinterId = printer.Id;
            var config = (OctoprintConfig) printer.Config;

            _url = NormalizeOctoprintUrl(config);
            _apiKey = config.ApiKey;
        }

        public override int PrinterId { get; }

        /// <summary>
        /// This uses the Octoprint API to pause the print,
        /// this is needed because the Gcode command only works
        /// when printing from SD, where as when printing from 
        /// Octoprint the commands are streamed to the printer.
        /// </summary>
        public override Task PausePrint()
        {
            return Execute("job", Method.POST, new { command = "pause", action = "pause" });
        }

        /// <summary>
        /// This uses the Octoprint API to resume the print,
        /// this is needed because the Gcode command only works
        /// when printing from SD, where as when printing from 
        /// Octoprint the commands are streamed to the printer.
        /// </summary>
        public override Task ResumePrint()
        {
            return Execute("job", Method.POST, new { command = "pause", action = "resume" });
        }

        /// <summary>
        /// This uses the Octoprint API to cancel the print,
        /// this is needed because the Gcode command only works
        /// when printing from SD, where as when printing from 
        /// Octoprint the commands are streamed to the printer.
        /// </summary>
        public override Task CancelPrint()
        {
            return Execute("job", Method.POST, new { command = "cancel" });
        }

        protected override Task ExecuteGcode(string command)
        {
            return Execute("printer/command", Method.POST, new { command });
        }

        public override async Task LoadConfiguration(Printer printer)
        {
            try
            {
                var config = (OctoprintConfig)printer.Config;
                _url = NormalizeOctoprintUrl(config);
                _apiKey = config.ApiKey;

                var settings = await Execute("settings", Method.GET);
                config.WebCamUrl = new Uri(config.Url).ProcessUrl((string)settings["webcam"]["streamUrl"]);
                config.SnapshotUrl = new Uri(config.Url).ProcessUrl((string)settings["webcam"]["snapshotUrl"]);

                var printerProfiles = await Execute("printerprofiles", Method.GET);
                var octoprintProfiles = printerProfiles["profiles"]
                    .Value<JObject>()
                    .Properties()
                    .Where(p => p.Value.Type == JTokenType.Object)
                    .Select(p => p.Value.ToObject<JObject>())
                    .ToList();

                foreach (var octoprintProfile in octoprintProfiles)
                {
                    var profile = new OctoprintProfile
                    {
                        Id = (string)octoprintProfile["id"],
                        Name = (string)octoprintProfile["name"]
                    };

                    if ((bool)octoprintProfile["current"])
                    {
                        config.Profile = profile;
                        config.HeatedBed = (bool)octoprintProfile["heatedBed"];
                        config.Tools = Enumerable.Range(0, (int)octoprintProfile["extruder"]["count"]).Select(index => $"tool{index}").ToList();
                    }
                    
                    config.AvailableProfiles.Add(profile);
                }
            }
            catch (Exception ex)
            {
                Log.Error("Load Configuration Failure", ex);
                throw;
            }
        }

        protected override async Task<PrinterStatus> AcquireStatus(CancellationToken cancellationToken)
        {
            var stateResponse = await Execute("printer", Method.GET, cancellationToken);
            var status = new PrinterStatus { PrinterId = PrinterId };

            status.Temperatures = stateResponse["temperature"]
                .Value<JObject>()
                .Properties()
                .Where(p => p.Value.Type == JTokenType.Object)
                .ToDictionary(p => p.Name, p =>
                {
                    var temp = p.Value.ToObject<JToken>();
                    return new TemperatureStatus
                    {
                        Name = p.Name,
                        Actual = (float)temp["actual"],
                        Target = (float)temp["target"]
                    };
                });

            var flags = stateResponse["state"]["flags"];
            if ((bool)flags["printing"] || (bool)flags["paused"])
            {
                status.State = (bool)flags["paused"] ? PrinterState.Paused : PrinterState.Printing;

                var jobStatus = await Execute("job", Method.GET, cancellationToken);
                status.ElapsedPrintTime = (int?)jobStatus["progress"]["printTime"] ?? 0;
                status.EstimatedTimeRemaining = (int?)jobStatus["progress"]["printTimeLeft"] ?? 0;
                status.Progress = (float?)jobStatus["progress"]["completion"] ?? 0;
            }
            else
            {
                status.State = PrinterState.Idle;
            }

            return status;
        }

        string NormalizeOctoprintUrl(OctoprintConfig config)
        {
            return new Uri(config.Url).ProcessUrl("/api");
        }

        async Task<JObject> Execute(string resource, Method method, CancellationToken cancellation, object body = null)
        {
            return HandleResult(await CreateClient().ExecuteTaskAsync(CreateRequest(resource, method, body), cancellation));
        }

        async Task<JObject> Execute(string resource, Method method, object body = null)
        {
            return HandleResult(await CreateClient().ExecuteTaskAsync(CreateRequest(resource, method, body)));
        }

        JObject HandleResult(IRestResponse response)
        {
            if (response.ErrorException != null || (int)response.StatusCode >= 400)
                throw new Exception(response.Content);

            if (string.IsNullOrWhiteSpace(response.Content)) return null;
            if (!response.ContentType.Contains("json")) return null;

            return JObject.Parse(response.Content);
        }

        RestClient CreateClient()
        {
            var client = new RestClient { BaseUrl = new Uri(_url) };            
            client.AddDefaultHeader("X-Api-Key", _apiKey);

            return client;
        }

        RestRequest CreateRequest(string resource, Method method, object body = null)
        {
            var request = new RestRequest(resource, method);

            if (body != null)
                request.AddJsonBody(body);

            return request;
        }
    }
}