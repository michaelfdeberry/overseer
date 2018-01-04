using System.Collections.Generic;

namespace Octoprint.Models
{
    public class FileInformation
    {
        public long Date { get; set; }

        public string Hash { get; set; }

        public string Name { get; set; }

        public string Origin { get; set; }

        public string Path { get; set; }

        public References Refs { get; set; }

        public long Size { get; set; }

        public string Type { get; set; }

        public IReadOnlyList<string> TypePath { get; set; }

        public GcodeAnalysis GcodeAnalysis { get; set; }

        public FilePrintStatistics Print { get; set; }

        public IEnumerable<FileInformation> Children { get; set; }
    }
}