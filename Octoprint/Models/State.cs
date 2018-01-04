namespace Octoprint.Models
{
    public class StateFlags
    {
        public bool Operational { get; set; }

        public bool Paused { get; set; }

        public bool Printing { get; set; }

        public bool SdReady { get; set; }

        public bool Error { get; set; }

        public bool Ready { get; set; }

        public bool ClosedOnError { get; set; }
    }

    public class State
    {
        public string Text { get; set; }

        public StateFlags Flags { get; set; }
    }
}