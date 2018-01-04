using System.Collections.Generic;

namespace Overseer.Core.Models
{
    /// <summary>
    /// Wrapper for the octoprint profile configuration
    /// </summary>
    public class OctoprintProfile
    {
        /// <summary>
        /// profile id
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// profile name
        /// </summary>
        public string Name { get; set; }
    }

    public class OctoprintConfig : PrinterConfig
    {
        public override PrinterType PrinterType => PrinterType.Octoprint;

        /// <summary>
        /// The url for the octoprint instance
        /// </summary>
        public string Url { get; set; }

        /// <summary>
        /// The octoprint api key
        /// </summary>
        public string ApiKey { get; set; }

        /// <summary>
        /// The profile that will be used when interacting with the printer
        /// </summary>
        /// <remarks>
        /// Currently not used, but here for potential future features
        /// </remarks>
        public OctoprintProfile Profile { get; set; }

        /// <summary>
        /// The profiles available for this instance
        /// </summary>
        public List<OctoprintProfile> AvailableProfiles { get; set; }
    }
}