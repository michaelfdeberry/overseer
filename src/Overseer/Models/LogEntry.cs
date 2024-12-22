using System;
using System.Text.Json.Serialization;

namespace Overseer.Models
{
    public class LogEntry
    {
        public string FileName { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public LogLevel Level { get; set; }

        public string LineNumber { get; set; }

        public string Message { get; set; }

        public DateTime Timestamp { get; set; }

        public object[] Additional { get; set; }

        public override string ToString()
        {
            return $"{Timestamp} - {Level} in {FileName}: {Message}{Environment.NewLine}{string.Join(",", Additional ?? new object[] { })}";
        }
    }
}
