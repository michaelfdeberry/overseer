using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Security.Cryptography.X509Certificates;
using System.Threading;
using System.Threading.Tasks;

using Newtonsoft.Json;

using Overseer.Models;

using RestSharp;

using Timer = System.Timers.Timer;

namespace Overseer.Machines.Providers
{
  public abstract class PollingMachineProvider<TMachine> : MachineProvider<TMachine> where TMachine : Machine, IPollingMachine, new()
  {
    public class FetchRequest
    {
      public string Method { get; set; } = "GET";
      public Dictionary<string, string> Query { get; set; } = [];
      public Dictionary<string, string> Headers { get; set; } = [];
      public object Body { get; set; } = null;
    }

    //if there are 5 consecutive errors 
    const int MaxExceptionCount = 5;

    //reduce the update interval to every 2 minutes
    const int ExceptionTimeout = 2;

    public override event EventHandler<EventArgs<MachineStatus>> StatusUpdate;

    readonly Stopwatch _stopwatch = new();

    Timer _timer;

    CancellationTokenSource _cancellation;

    X509Certificate2Collection _clientCertificateChain;

    int _exceptionCount;

    public override void Start(int interval)
    {
      // if it's getting called while already running the interval likely changed
      _timer?.Dispose();
      _timer = new(interval);
      _timer.Elapsed += async (sender, args) => await Poll();
      _timer.Start();
      Task.Run(Poll);
    }

    public override void Stop()
    {
      _timer?.Dispose();
      _timer = null;
    }

    protected abstract Task<MachineStatus> AcquireStatus(CancellationToken cancellationToken);

    protected async Task Poll()
    {
      //if the stopwatch is running and it's in the timeout period just return an offline status
      if (_stopwatch.IsRunning && _stopwatch.Elapsed.TotalMinutes < ExceptionTimeout)
      {
        StatusUpdate?.Invoke(this, new EventArgs<MachineStatus>(new() { MachineId = MachineId }));
      }

      try
      {
        // if the previous cancellation token is still running cancel it
        if (_cancellation != null)
        {
          _cancellation.Cancel();
          _cancellation.Dispose();
        }

        //if the stopwatch isn't running or if the timeout period is exceeded try to get the status
        _cancellation = new CancellationTokenSource();
        var status = await AcquireStatus(_cancellation.Token);

        //if the status was retrieve successfully reset the exception count and stop the stopwatch
        _exceptionCount = 0;
        _stopwatch.Stop();
        _cancellation.Dispose();
        _cancellation = null;

        StatusUpdate?.Invoke(this, new EventArgs<MachineStatus>(status));
      }
      catch (Exception ex)
      {
        if (++_exceptionCount >= MaxExceptionCount)
        {
          //start the timer, or restart the timer in the case it was already running,
          //this will keep the machine in an offline state and recheck again after the timeout period
          _stopwatch.Restart();
          Log.Error("Max consecutive failure count reached, throttling updates", ex);
        }

        StatusUpdate?.Invoke(this, new EventArgs<MachineStatus>(new() { MachineId = MachineId }));
      }
    }

    protected virtual async Task<dynamic> Fetch(string resource, FetchRequest fetchRequest = default, CancellationToken cancellation = default)
    {
      using var client = new RestClient(new RestClientOptions
      {
        BaseUrl = new Uri(Machine.Url),
        ClientCertificates = GetClientCertificate(Machine.ClientCertificate)
      });

      var request = new RestRequest(resource, (Method)Enum.Parse(typeof(Method), fetchRequest?.Method ?? "Get", true));
      if (fetchRequest.Body != null)
      {
        request.AddJsonBody(fetchRequest.Body);
      }

      fetchRequest.Headers?.ToList().ForEach(header => request.AddParameter(header.Key, header.Value, ParameterType.HttpHeader));
      fetchRequest.Query?.ToList().ForEach(p => request.AddParameter(p.Key, p.Value, ParameterType.QueryString));

      var response = await client.ExecuteAsync(request, cancellation);

      if (response.ErrorException != null)
        throw response.ErrorException;

      if ((int)response.StatusCode >= 400)
      {
        throw new Exception($"StatusCode: {(int)response.StatusCode}\nContent: {response.Content}");
      }

      if (string.IsNullOrWhiteSpace(response.Content)) return null;
      if (!response.ContentType.Contains("json")) return null;

      return JsonConvert.DeserializeObject(response.Content);
    }


    X509Certificate2Collection GetClientCertificate(string commonName)
    {
      //if no name for the certificate is provided return null
      if (string.IsNullOrWhiteSpace(commonName)) return null;

      //if the cached certificate chain contains a matching certificate use it
      if (_clientCertificateChain?.Find(X509FindType.FindBySubjectName, commonName, false).Count > 0)
        return _clientCertificateChain;

      //otherwise try to get it from the store
      try
      {
        var certificateStore = new X509Store(StoreName.My, StoreLocation.CurrentUser);
        certificateStore.Open(OpenFlags.ReadOnly);

        _clientCertificateChain = certificateStore.Certificates.Find(X509FindType.FindBySubjectName, commonName, false);
        certificateStore.Close();

        return _clientCertificateChain;
      }
      catch (Exception ex)
      {
        Log.Error($"Unable to find {commonName} for {StoreName.My} in {StoreLocation.CurrentUser}", ex);
        return null;
      }
    }

    protected static Uri ProcessUri(string url, string refPath = "")
    {
      refPath ??= string.Empty;
      var uri = new Uri(url);
      var refQuery = string.Empty;
      var refPort = uri.Port;

      if (Uri.TryCreate(refPath, UriKind.Absolute, out var refUri) && refUri.Scheme.StartsWith("http"))
      {
        //if the host is a loopback ip address assume it's local to base uri and construct a new url with the public host
        if (refUri.Host == "localhost" || (IPAddress.TryParse(refUri.Host, out var ip) && IPAddress.IsLoopback(ip)))
        {
          refPath = refUri.PathAndQuery;
          refPort = refUri.Port;
        }
        else
        {
          //if the reference path is an absolute url use the absolute url. 
          return refUri;
        }
      }

      refPath = refPath.TrimStart('/');
      if (refPath.Contains('?'))
      {
        var parts = refPath.Split('?');
        refPath = parts.First();
        refQuery = $"?{parts.Last()}";
      }

      // if the ports are the same, join the paths. 
      if (refPort == uri.Port)
      {
        var delimiter = uri.LocalPath.EndsWith('/') ? string.Empty : "/";
        refPath = $"{uri.LocalPath}{delimiter}{refPath}";
      }

      return new UriBuilder(uri.Scheme, uri.Host, refPort, refPath, refQuery).Uri;
    }
  }
}