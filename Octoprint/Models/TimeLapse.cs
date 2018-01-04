using System.Collections.Generic;

namespace Octoprint.Models
{
    public class Timelapse
    {
        public string Name { get; set; }

        public string Size { get; set; }

        public int Bytes { get; set; }

        public string Date { get; set; }

        public string Url { get; set; }
    }

    public class UnrenderedTimelapse : Timelapse
    {
        public bool Recording { get; set; }

        public bool Rendering { get; set; }

        public bool Processing { get; set; }
    }

    public class TimelapseConfig
    {
        public string Type { get; set; }

        public int PostRoll { get; set; }

        public int Fps { get; set; }

        public float RetractionZHop { get; set; }

        public int Interval { get; set; }
    }

    public class TimeLapseDetails
    {
        public TimelapseConfig Config { get; set; }

        public IReadOnlyList<Timelapse> Files { get; set; }

        public IReadOnlyList<UnrenderedTimelapse> Unrendered { get; set; }
    }
}