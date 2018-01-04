using System;

namespace Octoprint.Models
{
    public class VersionDetails
    {
        public string Api { get; set; }

        public string Server { get; set; }

        public Version ApiVersion => Version.Parse(Api);

        public Version ServerVersion => Version.Parse(Server);
    }
}