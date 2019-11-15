using log4net;
using log4net.Appender;
using Nancy;
using Nancy.ModelBinding;
using System;
using System.IO;
using System.Linq;

namespace Overseer.Daemon.Modules
{
    public class LoggingModule : NancyModule
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(LoggingModule));
       
        public enum LogLevel
        {
            TRACE = 0,
            DEBUG,
            INFO,
            LOG,
            WARN,
            ERROR,
            FATAL,
            OFF
        }

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
                return $"{Timestamp} - {(LogLevel)Level} in {FileName}: {Message}{Environment.NewLine}{string.Join(",", Additional ?? new object[]{ })}";
            }
        }

        public LoggingModule() : base("Logging")
        {
            Get("/", _ =>
            {
                var fileAppender = LogManager
                    .GetAllRepositories()
                    .SelectMany(r => r.GetAppenders())
                    .OfType<FileAppender>()
                    .FirstOrDefault();

                if (fileAppender == null) return string.Empty;
                if (string.IsNullOrWhiteSpace(fileAppender.File)) return string.Empty;
                if (!File.Exists(fileAppender.File)) return string.Empty;

                // copy the file and then read because the logger keeps the file open
                var tempPath = Path.GetTempFileName();
                File.Copy(fileAppender.File, tempPath, true);
                var logFileContent = File.ReadAllText(tempPath);
                File.Delete(tempPath);

                return new { content = logFileContent };
            });

            Post("/", _ =>
            {
                var logEntry = this.Bind<LogEntry>();
                switch ((LogLevel)logEntry.Level)
                {             
                    case LogLevel.INFO:
                        Log.Info(logEntry.ToString());
                        break;
                    case LogLevel.WARN:
                        Log.Warn(logEntry.ToString());
                        break;
                    case LogLevel.ERROR:
                    case LogLevel.FATAL:
                        Log.Error(logEntry.ToString());
                        break; 
                    default:
                        Log.Debug(logEntry.ToString());
                        break;
                }

                return HttpStatusCode.OK;
            });
        }
    }
}
