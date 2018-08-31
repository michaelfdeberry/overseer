using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Overseer.Core.Models
{
    /// <summary>
    /// Contains common configuration properties for printer providers that 
    /// derive from the resetful printer provider
    /// </summary>
    public abstract class RestPrinterConfig : PrinterConfig
    {
        /// <summary>
        /// The url for the printer instance
        /// </summary>
        public string Url { get; set; }
        
        /// <summary>
        /// The text for the PEM certificate that will be used for client authentication
        /// </summary>
        public string ClientCertificatePem { get; set; }
    }
}
