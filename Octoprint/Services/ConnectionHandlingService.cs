using System.Threading.Tasks;
using Octoprint.Models;
using RestSharp;

namespace Octoprint.Services
{
    public class ConnectionHandlingService : OctoprintService
    {
        public ConnectionHandlingService(OctoprintOptions options)
            : base(options)
        {
        }

        public Task<ConnectionSettings> GetSettings()
        {
            return Execute<ConnectionSettings>("connection", Method.GET);
        }

        public Task Connect(ConnectionRequest request)
        {
            return Connect(request.PrinterProfile, request.Port, request.Baudrate, request.Save, request.Autoconnect);
        }

        public Task Connect(string printerProfile, string port, int? baudrate, bool? save, bool? autoconnect)
        {
            return Execute("connection", Method.POST, new
            {
                command = "connect",
                printerProfile,
                port,
                baudrate,
                save,
                autoconnect
            });
        }

        public Task Disconnect()
        {
            return Execute("connection", Method.POST, new {command = "disconnect"});
        }
    }
}