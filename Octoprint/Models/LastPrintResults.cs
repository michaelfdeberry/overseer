namespace Octoprint.Models
{
    public class LastPrintResults
    {
        public long Date { get; set; }

        public bool Success { get; set; }

        public long PrintTime { get; set; }
    }
}