namespace Overseer.Core.Models
{
    /// <summary>
    ///     This will be used when serializing the printer config or creating the provider instance
    ///     The convention is that the provider and config should be prefixed with the printer type name.
    ///     Configs should exist in the Overseer.Core.Models namespace.
    ///     Providers should exist in the Overseer.Core.PrinterProviders namespace.
    ///     For example, Octoprint's printer config should be named OctoprintConfig
    ///     and it's provider should be named OctoprintProvider
    /// </summary>
    public enum PrinterType
    {
        Unknown,
        Octoprint,
        RepRap
    }
}