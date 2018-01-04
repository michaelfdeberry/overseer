using System.Collections.Generic;

namespace Octoprint.Models
{
    public class ConnectionOptions
    {
        public IReadOnlyList<string> Ports { get; set; }

        public IReadOnlyList<string> Baudrates { get; set; }

        public IEnumerable<PrinterProfileBase> PrinterProfiles { get; set; }

        public string PortPreference { get; set; }

        public string PrinterProfilePreference { get; set; }

        public bool Autoconnect { get; set; }
    }
}