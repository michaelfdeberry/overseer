namespace Octoprint.Models
{
    public class ConnectionRequest
    {
        public string PrinterProfile { get; set; }

        public string Port { get; set; }

        public int? Baudrate { get; set; }

        public bool? Save { get; set; }

        public bool? Autoconnect { get; set; }
    }
}