using System;
using System.Diagnostics;
using System.Reflection;
using System.Runtime.InteropServices;

namespace Overseer.Models
{
    public class ApplicationInfo
    {
        static readonly Lazy<ApplicationInfo> AppInfoLazy = new Lazy<ApplicationInfo>(() => new ApplicationInfo());

        public static ApplicationInfo Instance => AppInfoLazy.Value;

        public ApplicationInfo()
        {
            Platform = Environment.OSVersion.Platform.ToString();
            OperatingSystem = Environment.OSVersion.VersionString;
            MachineName = Environment.MachineName;
            Version = FileVersionInfo.GetVersionInfo(Assembly.GetAssembly(GetType()).Location).FileVersion;
            Runtime = RuntimeInformation.FrameworkDescription;
        }

        public string Platform { get; }

        public string OperatingSystem { get; }

        public string MachineName { get; }

        public string Version { get; }

        public string Runtime { get; set; }
    }
}
