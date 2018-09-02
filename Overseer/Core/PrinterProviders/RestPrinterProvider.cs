using Newtonsoft.Json.Linq;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Security.Cryptography.X509Certificates;
using System.Threading;
using System.Threading.Tasks;
using log4net;

namespace Overseer.Core.PrinterProviders
{
    /// <summary>
    /// An abstract implementation of the printer provider with
    /// support for making REST request. 
    /// </summary>
    public abstract class RestPrinterProvider : PrinterProvider
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(RestPrinterProvider));

        protected abstract Uri ServiceUri { get; }

        protected virtual Dictionary<string, string> Headers { get; } = new Dictionary<string, string>();

        X509Certificate2Collection _clientCertificate;

        public Task<JObject> ExecuteRequest(string resource, 
            Method method = Method.GET,
            IEnumerable<(string name, string value)> parameters = null,
            object body = null,
            CancellationToken cancellation = default(CancellationToken))
        {
            var request = new RestRequest(resource, method);
             
            parameters?.ForEach(p => request.AddParameter(p.name, p.value, ParameterType.QueryString));

            if (body != null)
            {
                request.AddJsonBody(body);
            }
            
            return ExecuteRequest(request, cancellation);
        }

        public async Task<JObject> ExecuteRequest(IRestRequest request, CancellationToken cancellationToken)
        {
            var client = new RestClient(ServiceUri);
            Headers?.ForEach(header => client.AddDefaultHeader(header.Key, header.Value));

            if (_clientCertificate != null && _clientCertificate.Count > 0)
            {
                client.ClientCertificates = _clientCertificate;
            }
            
            var response = await client.ExecuteTaskAsync(request, cancellationToken);

            if (response.ErrorException != null)
                throw response.ErrorException;

            if ((int)response.StatusCode >= 400)
                throw new Exception($"The service responded with status code {response.StatusCode}({(int)response.StatusCode}): {response.Content}");

            if (string.IsNullOrWhiteSpace(response.Content)) return null;
            if (!response.ContentType.Contains("json")) return null;

            return JObject.Parse(response.Content);
        }

        protected void AddClientCertificate(string commonName)
        {
            if (string.IsNullOrWhiteSpace(commonName)) return;

            try
            {
                _clientCertificate = FindCertificate(commonName, StoreName.My, StoreLocation.CurrentUser);
            }
            catch (Exception ex)
            {
                Log.Error("Failed To Add Client Certificate", ex);
            }
        }

        static X509Certificate2Collection FindCertificate(string commonName, StoreName storeName, StoreLocation storeLocation)
        {
            try
            {
                var certificateStore = new X509Store(storeName, storeLocation);
                certificateStore.Open(OpenFlags.ReadOnly);

                var certificates = certificateStore.Certificates.Find(X509FindType.FindBySubjectName, commonName, false);
                certificateStore.Close();

                return certificates;
            }
            catch (Exception ex)
            {
                Log.Error($"Unable to find {commonName} for {storeName} in {storeLocation}", ex);
                return null;
            }
        }
    }
}

