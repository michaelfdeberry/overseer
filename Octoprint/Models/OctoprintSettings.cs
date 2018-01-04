using System.Collections.Generic;
using Newtonsoft.Json;

namespace Octoprint.Models
{
    public class OctoprintSettings
    {
        public OctoprintApiSettings Api { get; set; }

        public OctoprintAppearance Appearance { get; set; }

        public OctoprintFeatures Feature { get; set; }

        public OctoprintFolders Folder { get; set; }

        public Dictionary<string, Dictionary<string, object>> Plugins { get; set; }

        public OctoprintPrinterSettings Printer { get; set; }

        public OctoprintScriptSettings Scripts { get; set; }

        public OctoprintSerialSettings Serial { get; set; }

        public OctoprintServerSettings Server { get; set; }

        public OctoprintSystemSettings System { get; set; }

        public OctoprintTemperatureSettings Temperature { get; set; }

        public IReadOnlyList<OctoprintTerminalFilterSettings> TerminalFilters { get; set; }

        public OctorprintWebcamSettings Webcam { get; set; }
    }

    public class OctoprintApiKeyRefreshResult
    {
        [JsonProperty("apikey")]
        public string ApiKey { get; set; }
    }

    public class OctoprintApiSettings
    {
        public bool Enabled { get; set; }

        public string Key { get; set; }

        public bool AllowCrossOrigin { get; set; }
    }

    public class OctoprintAppearance
    {
        public string Name { get; set; }

        public string Color { get; set; }

        public bool ColorTransparent { get; set; }

        public string DefaultLanguage { get; set; }

        public bool ShowFahrenheitAlso { get; set; }
    }

    public class OctoprintFeatures
    {
        [JsonProperty("gcodeviewer")]
        public bool GcodeViewerEnable { get; set; }

        [JsonProperty("sizeThreshold")]
        public long GcodeViewerSizeThreshold { get; set; }

        [JsonProperty("mobileSizeThreshold")]
        public long GcodeViewerMobileSizeThreshold { get; set; }

        [JsonProperty("temperatureGraph")]
        public bool TemperatureGraphEnabled { get; set; }

        public bool WaitForStart { get; set; }

        public bool AlwaysSendChecksum { get; set; }

        public bool NeverSendChecksum { get; set; }

        [JsonProperty("sdSupport")]
        public bool SdSupportEnabled { get; set; }

        public bool SdRelativePath { get; set; }

        public bool SdAlwaysVisible { get; set; }

        public bool SwallowOkAfterResend { get; set; }

        public bool RepetierTargetTemp { get; set; }

        public bool ExternalHeatupDetection { get; set; }

        [JsonProperty("keyboardControl")]
        public bool KeyboardControlEnabled { get; set; }

        public bool PollWatched { get; set; }

        public bool IngnoreIdenticalResends { get; set; }

        public bool ModelSizeDetection { get; set; }

        public bool FirmwareDetection { get; set; }

        public bool PrintCancelConfirmation { get; set; }

        public bool BlockWhileDwelling { get; set; }

        public bool G90InfluencesExtruder { get; set; }
    }

    public class OctoprintFolders
    {
        public string Uploads { get; set; }

        public string Timelapse { get; set; }

        [JsonProperty("timelapseTmp")]
        public string TimelapseTemp { get; set; }

        public string Logs { get; set; }

        public string Watched { get; set; }
    }

    public class OctoprintPrinterSettings
    {
        public int DefaultExtrusionLength { get; set; }
    }

    public class OctoprintGcodeScriptSettings
    {
        public string AfterPrintCancelled { get; set; }

        [JsonProperty("snippets/disable_bed")]
        public string DisableBedSnippet { get; set; }

        [JsonProperty("snippets/disable_hotends")]
        public string DisableHotendsSnippet { get; set; }
    }

    public class OctoprintScriptSettings
    {
        public OctoprintGcodeScriptSettings Gcode { get; set; }
    }

    public class OctoprintSerialSettings
    {
        public IReadOnlyList<int> AdditionalBaudrates { get; set; }

        public IReadOnlyList<string> AdditionalPorts { get; set; }

        public bool Autoconnect { get; set; }

        public int Baudrate { get; set; }

        public IReadOnlyList<int> BaudrateOptions { get; set; }

        public IReadOnlyList<string> ChecksumRequiringCommands { get; set; }

        public bool DisconnectOnErrors { get; set; }

        public string HelloCommand { get; set; }

        public bool IgnoreErrorsFromFirmware { get; set; }

        [JsonProperty("log")]
        public bool LoggingEnabled { get; set; }

        public IReadOnlyList<string> LongRunningCommands { get; set; }

        public float MaxTimeoutsIdle { get; set; }

        public float MaxTimeoutsLong { get; set; }

        public float MaxTimeoutsPrinting { get; set; }

        public string Port { get; set; }

        public IReadOnlyList<string> PortOptions { get; set; }

        public bool SupportResendsWithoutOk { get; set; }

        public float TimeoutCommunication { get; set; }

        public float TimeoutConnection { get; set; }

        public float TimeoutDetection { get; set; }

        public float TimeoutSdStatus { get; set; }

        public float TimeoutTemperature { get; set; }

        public float TimeoutTemperatureTargetSet { get; set; }

        public bool TriggerOkForM29 { get; set; }
    }

    public class OctoprintServerCommands
    {
        public string ServerRestartCommand { get; set; }

        public string SystemRestartCommand { get; set; }

        public string SystemShutdownCommand { get; set; }
    }

    public class OctoprintServerDiskspace
    {
        public long Critical { get; set; }

        public long Warning { get; set; }
    }

    public class OctoprintServerSettings
    {
        public OctoprintServerCommands Commands { get; set; }

        public OctoprintServerDiskspace Diskspace { get; set; }
    }

    public class OctoprintCommandList
    {
        public IReadOnlyList<OctoprintActionSettings> Core { get; set; }

        public IReadOnlyList<OctoprintActionSettings> Custom { get; set; }
    }

    public class OctoprintActionSettings
    {
        public string Name { get; set; }

        public string Action { get; set; }

        public string Command { get; set; }

        public string Confirm { get; set; }

        public bool Async { get; set; }

        public bool Ignore { get; set; }

        public string Source { get; set; }

        public string Resource { get; set; }
    }

    public class OctoprintEventSettings
    {
        public string Event { get; set; }

        public string Command { get; set; }

        public string Type { get; set; }

        public bool Enabled { get; set; }

        public bool Debug { get; set; }
    }

    public class OctoprintSystemSettings
    {
        public IReadOnlyList<OctoprintActionSettings> Actions { get; set; }

        public Dictionary<string, IReadOnlyList<OctoprintEventSettings>> Events { get; set; }
    }

    public class OctoprintTemperatureProfileSettings
    {
        public float Bed { get; set; }

        public float Extruder { get; set; }

        public string Name { get; set; }
    }

    public class OctoprintTemperatureSettings
    {
        public int Cutoff { get; set; }

        public IReadOnlyList<OctoprintTemperatureProfileSettings> Profiles { get; set; }
    }

    public class OctoprintTerminalFilterSettings
    {
        public string Name { get; set; }

        public string Regex { get; set; }
    }

    public class OctorprintWebcamSettings
    {
        public string Bitrate { get; set; }

        public string FfmpegPath { get; set; }

        public string FfmpegThreads { get; set; }

        [JsonProperty("flipH")]
        public bool FlipHorizontal { get; set; }

        [JsonProperty("flipV")]
        public bool FlipVertical { get; set; }

        [JsonProperty("rotate90")]
        public bool Rotate90Degrees { get; set; }

        public string SnapshotUrl { get; set; }

        public string StreamRatio { get; set; }

        public string StreamUrl { get; set; }

        public bool Watermark { get; set; }
    }
}