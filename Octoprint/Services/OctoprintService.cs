using System;
using System.Threading.Tasks;
using Octoprint.Json;
using Octoprint.Models;
using RestSharp;

namespace Octoprint.Services
{
    public abstract class OctoprintService
    {
        readonly OctoprintOptions _options;

        protected OctoprintService(OctoprintOptions options)
        {
            _options = options;
        }

        public string ApiKey => _options.ApiKey;

        public string BaseUri => _options.Uri;

        protected Task<T> Execute<T>(string resource, Method method, object body = null) where T : new()
        {
            return Execute<T>(CreateRequest(resource, method, body));
        }

        protected async Task<T> Execute<T>(RestRequest request) where T : new()
        {
            var client = CreateClient();

            var response = await client.ExecuteTaskAsync<T>(request);
            ErrorCheck(response);

            return response.Data;
        }

        protected Task Execute(string resource, Method method, object body = null)
        {
            return Execute(CreateRequest(resource, method, body));
        }

        protected async Task Execute(RestRequest request)
        {
            var client = CreateClient();
            ErrorCheck(await client.ExecuteTaskAsync(request));
        }

        void ErrorCheck(IRestResponse response)
        {
            if (response.ErrorException != null || (int) response.StatusCode >= 400)
                throw new Exception(response.Content);
        }

        RestClient CreateClient()
        {
            var client = new RestClient {BaseUrl = new Uri(BaseUri)};
            var deserializer = new NewtonsoftJsonDeserializer();
            client.AddHandler("application/json", deserializer);
            client.AddHandler("text/json", deserializer);
            client.AddHandler("text/x-json", deserializer);
            client.AddHandler("text/javascript", deserializer);
            client.AddHandler("*+json", deserializer);

            client.AddDefaultHeader("X-Api-Key", ApiKey);

            return client;
        }

        public RestRequest CreateRequest(string resource, Method method, object body = null)
        {
            var request = new RestRequest(resource, method);
            request.JsonSerializer = new NewtonsoftJsonSerializer();

            if (body != null)
                request.AddJsonBody(body);

            return request;
        }
    }
}