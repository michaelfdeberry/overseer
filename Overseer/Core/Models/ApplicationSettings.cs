using Overseer.Core.Data;

namespace Overseer.Core.Models
{
    public class ApplicationSettings : IEntity
    {
        public const int DefaultPort = 9000;
        public const int DefaultInterval = 10000;
        
        public int Id { get; set; }

        /// <summary>
        /// How often the app will poll the printer for information
        /// </summary>
        public int Interval { get; set; } = DefaultInterval;

        /// <summary>
        /// The port that the application will be accessible on
        /// </summary>
        public int LocalPort { get; set; } = DefaultPort;

        /// <summary>
        /// If true disabled printers won't be visible on the monitoring screen
        /// </summary>
        public bool HideDisabledPrinters { get; set; }

        /// <summary>
        /// Specifies if the application should require user authentication
        /// </summary>
        public bool RequiresAuthentication { get; set; }
    }
}