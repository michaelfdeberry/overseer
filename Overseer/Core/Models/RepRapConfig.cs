namespace Overseer.Core.Models
{
    public class RepRapConfig : PrinterConfig
    {
        public override PrinterType PrinterType => PrinterType.RepRap;

        public string Url { get; set; }

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