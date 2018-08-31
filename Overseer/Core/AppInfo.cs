using System;
using System.Diagnostics;
using System.Reflection;

namespace Overseer.Core
{
    public class AppInfo
    {
        static readonly Lazy<AppInfo> AppInfoLazy = new Lazy<AppInfo>(() => new AppInfo());

        public static AppInfo Instance => AppInfoLazy.Value;

        public AppInfo()
        {
            Platform = Environment.OSVersion.Platform;
            OperatingSystem = Environment.OSVersion.VersionString;
            MachineName = Environment.MachineName;
            Version = FileVersionInfo.GetVersionInfo(Assembly.GetAssembly(GetType()).Location).ProductVersion;
        }

        public PlatformID Platform { get; }

        public string OperatingSystem { get; }

        public string MachineName { get; }

        public string Version { get; }
    }
}
