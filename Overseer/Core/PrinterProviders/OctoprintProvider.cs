﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using log4net;
using Newtonsoft.Json.Linq;
using Overseer.Core.Exceptions;
using Overseer.Core.Models;
using RestSharp;

namespace Overseer.Core.PrinterProviders
{
    public class OctoprintProvider : RestPrinterProvider
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(OctoprintProvider));
        string _apiKey;
        string _url;
        
        public OctoprintProvider(Printer printer)
        {
            PrinterId = printer.Id;
            var config = (OctoprintConfig)printer.Config;

            _url = NormalizeOctoprintUrl(config);
            _apiKey = config.ApiKey;
        }

        public override int PrinterId { get; }

        protected override Uri ServiceUri => new Uri(_url);

        protected override Dictionary<string, string> Headers => new Dictionary<string, string>
        {
            { "X-Api-Key", _apiKey }
        };

        /// <summary>
        /// This uses the Octoprint API to pause the print,
        /// this is needed because the Gcode command only works
        /// when printing from SD, where as when printing from 
        /// Octoprint the commands are streamed to the printer.
        /// </summary>
        public override Task PausePrint()
        {
            return ExecuteRequest("job", Method.POST, body: new { command = "pause", action = "pause" });
        }

        /// <summary>
        /// This uses the Octoprint API to resume the print,
        /// this is needed because the Gcode command only works
        /// when printing from SD, where as when printing from 
        /// Octoprint the commands are streamed to the printer.
        /// </summary>
        public override Task ResumePrint()
        {
            return ExecuteRequest("job", Method.POST, body: new { command = "pause", action = "resume" });
        }

        /// <summary>
        /// This uses the Octoprint API to cancel the print,
        /// this is needed because the Gcode command only works
        /// when printing from SD, where as when printing from 
        /// Octoprint the commands are streamed to the printer.
        /// </summary>
        public override Task CancelPrint()
        {
            return ExecuteRequest("job", Method.POST, body: new { command = "cancel" });
        }

        protected override Task ExecuteGcode(string command)
        {
            return ExecuteRequest("printer/command", Method.POST, body: new { command });
        }

        public override async Task LoadConfiguration(Printer printer)
        {
            try
            {
                var config = (OctoprintConfig)printer.Config;
                _url = NormalizeOctoprintUrl(config);
                _apiKey = config.ApiKey;

                var settings = await ExecuteRequest("settings");

                if (string.IsNullOrWhiteSpace(config.WebCamUrl))
                {
                    config.WebCamUrl = new Uri(config.Url).ProcessUrl((string)settings["webcam"]["streamUrl"]);                    
                }

                if (string.IsNullOrWhiteSpace(config.SnapshotUrl))
                {
                    config.SnapshotUrl = new Uri(config.Url).ProcessUrl((string)settings["webcam"]["snapshotUrl"]);
                }

                var printerProfiles = await ExecuteRequest("printerprofiles");
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

                if (ex.InnerException is OverseerException)
                    throw ex.InnerException;

                if (ex.Message.Contains("Invalid API key"))
                    throw new OverseerException("Octoprint_InvalidKey");
                
                throw new OverseerException("Printer_ConnectFailure", printer);
            }
        }

        protected override async Task<PrinterStatus> AcquireStatus(CancellationToken cancellationToken)
        {
            var stateResponse = await ExecuteRequest("printer", cancellation: cancellationToken);
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

                var jobStatus = await ExecuteRequest("job", cancellation: cancellationToken);
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
    }
}