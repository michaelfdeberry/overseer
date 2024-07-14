using System;

namespace Overseer.Models
{
    public class LogEntry
    {
        public string FileName { get; set; }

        public int Level { get; set; }

        public string LineNumber { get; set; }

        public string Message { get; set; }

        public DateTime Timestamp { get; set; }

        public object[] Additional { get; set; }

        public override string ToString()
        {
            return $"{Timestamp} - {(LogLevel)Level} in {FileName}: {Message}{Environment.NewLine}{string.Join(",", Additional ?? new object[] { })}";
        }
    }
}
