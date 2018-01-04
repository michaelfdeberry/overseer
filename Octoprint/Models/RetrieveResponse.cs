using System.Collections.Generic;

namespace Octoprint.Models
{
    public class RetrieveResponse
    {
        public IReadOnlyList<FileInformation> Files { get; set; }

        public long Free { get; set; }

        public long Total { get; set; }
    }
}