using Newtonsoft.Json.Linq;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Overseer.Core.PrinterProviders
{
    /// <summary>
    /// An abstract implementation of the printer provider with
    /// support for making REST request. 
    /// </summary>
    public abstract class RestPrinterProvider : PrinterProvider
    {
        protected abstract Uri ServiceUri { get; }

        protected virtual Dictionary<string, string> Headers { get; } = new Dictionary<string, string>();

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
                request.AddBody(body);
            }
            
            return ExecuteRequest(request, cancellation);
        }

        public async Task<JObject> ExecuteRequest(IRestRequest request, CancellationToken cancellationToken)
        {
            var client = new RestClient(ServiceUri);
            Headers?.ForEach(header => client.AddDefaultHeader(header.Key, header.Value));
            
            var response = await client.ExecuteTaskAsync(request, cancellationToken);

            if (response.ErrorException != null)
                throw response.ErrorException;

            if ((int)response.StatusCode >= 400)
                throw new Exception($"The service responded with status code {response.StatusCode}({(int)response.StatusCode}): {response.Content}");

            Console.WriteLine("Response URI:" + response.ResponseUri);

            if (string.IsNullOrWhiteSpace(response.Content)) return null;
            if (!response.ContentType.Contains("json")) return null;

            return JObject.Parse(response.Content);
        }
    }
}
