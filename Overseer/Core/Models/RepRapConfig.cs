namespace Overseer.Core.Models
{
    public class RepRapConfig : RestPrinterConfig
    {
        public override PrinterType PrinterType => PrinterType.RepRap;

        /// <summary>
        /// TODO: Add password support
        /// </summary>
        public string Password { get; set; }

        /// <summary>
        /// TODO: Add password support
        /// </summary>
        public bool RequiresPassword { get; set; }
    }
}