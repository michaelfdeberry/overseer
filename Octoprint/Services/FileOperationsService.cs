using System.Threading.Tasks;
using Octoprint.Models;
using RestSharp;

namespace Octoprint.Services
{
    public class FileOperationsService : OctoprintService
    {
        public FileOperationsService(OctoprintOptions options) :
            base(options)
        {
        }

        public Task<RetrieveResponse> GetFiles(string location = null, bool recursive = false)
        {
            var resource = "files";
            if (!string.IsNullOrWhiteSpace(location))
                resource += $"/{location}";

            var request = CreateRequest(resource, Method.GET);

            if (recursive)
                request.AddQueryParameter("recursive", "true");

            return Execute<RetrieveResponse>(request);
        }

        public Task<FileInformation> GetFile(string location, string fileName)
        {
            return Execute<FileInformation>($"files/{location}/{fileName}", Method.GET);
        }

        public Task SelectFile(string location, string fileName, bool print = false)
        {
            return Execute($"files/{location}/{fileName}", Method.POST, new {command = "select", print});
        }

        public Task CopyFile(string location, string fileName, string destination)
        {
            return Execute($"files/{location}/{fileName}", Method.POST, new {command = "copy", destination});
        }

        public Task MoveFile(string location, string fileName, string destination)
        {
            return Execute($"files/{location}/{fileName}", Method.POST, new {command = "move", destination});
        }

        public Task DeleteFile(string location, string fileName)
        {
            return Execute(CreateRequest($"files/{location}/{fileName}", Method.DELETE));
        }
    }
}