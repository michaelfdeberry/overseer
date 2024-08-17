using log4net;
using Newtonsoft.Json.Linq;
using Overseer.Models;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Cryptography.X509Certificates;
using System.Threading;
using System.Threading.Tasks;

namespace Overseer.Machines.Providers
{
    /// <summary>
    /// Factored out the common connectivity functionality to reduce inheritance bloat.
    /// 
    /// This will be passed into the providers that require a HTTP connection. 
    /// </summary>
    public class RestMachineConnector<TMachine> where TMachine : Machine, IRestMachine, new()
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(RestMachineConnector<TMachine>));
        X509Certificate2Collection _clientCertificateChain;

        public virtual async Task<JObject> Request
        (
            TMachine machine,
            string resource,
            string method = "GET",
            IEnumerable<(string name, string value)> query = null,
            object body = null,
            CancellationToken cancellation = default
        )
        {
            var client = new RestClient(new RestClientOptions
            {
                BaseUrl = new Uri(machine.Url),
                ClientCertificates = GetClientCertificate(machine.ClientCertificate)
            });
            var request = new RestRequest(resource, (Method)Enum.Parse(typeof(Method), method, true));
            if (body != null)
            {
                request.AddJsonBody(body);
            }

            machine.Headers?.ToList().ForEach(header => client.AddDefaultHeader(header.Key, header.Value));
            query?.ToList().ForEach(p => request.AddParameter(p.name, p.value, ParameterType.QueryString));

            var response = await client.ExecuteAsync(request, cancellation);

            if (response.ErrorException != null)
                throw response.ErrorException;

            if ((int)response.StatusCode >= 400)
            {
                throw new Exception($"StatusCode: {(int)response.StatusCode}\nContent: {response.Content}");
            }

            if (string.IsNullOrWhiteSpace(response.Content)) return null;
            if (!response.ContentType.Contains("json")) return null;

            return JObject.Parse(response.Content);
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

        public virtual string ProcessUrl(string url, string refPath = "")
        {
            return ProcessUri(url, refPath).ToString();
        }

        public static Uri ProcessUri(string url, string refPath = "")
        { 
            refPath = refPath ?? string.Empty;
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
            if (refPath.Contains("?"))
            {
                var parts = refPath.Split('?');
                refPath = parts.First();
                refQuery = $"?{parts.Last()}";
            }

            // if the ports are the same, join the paths. 
            if (refPort == uri.Port)
            {
                var delimiter = uri.LocalPath.EndsWith("/") ? string.Empty : "/";
                refPath = $"{uri.LocalPath}{delimiter}{refPath}";
            }

            return new UriBuilder(uri.Scheme, uri.Host, refPort, refPath, refQuery).Uri;
        }
    }
}
