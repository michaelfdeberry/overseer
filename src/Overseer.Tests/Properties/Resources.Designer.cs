﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.42000
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Overseer.Tests.Properties {
    using System;
    
    
    /// <summary>
    ///   A strongly-typed resource class, for looking up localized strings, etc.
    /// </summary>
    // This class was auto-generated by the StronglyTypedResourceBuilder
    // class via a tool like ResGen or Visual Studio.
    // To add or remove a member, edit your .ResX file then rerun ResGen
    // with the /str option, or rebuild your VS project.
    [global::System.CodeDom.Compiler.GeneratedCodeAttribute("System.Resources.Tools.StronglyTypedResourceBuilder", "15.0.0.0")]
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute()]
    [global::System.Runtime.CompilerServices.CompilerGeneratedAttribute()]
    internal class Resources {
        
        private static global::System.Resources.ResourceManager resourceMan;
        
        private static global::System.Globalization.CultureInfo resourceCulture;
        
        [global::System.Diagnostics.CodeAnalysis.SuppressMessageAttribute("Microsoft.Performance", "CA1811:AvoidUncalledPrivateCode")]
        internal Resources() {
        }
        
        /// <summary>
        ///   Returns the cached ResourceManager instance used by this class.
        /// </summary>
        [global::System.ComponentModel.EditorBrowsableAttribute(global::System.ComponentModel.EditorBrowsableState.Advanced)]
        internal static global::System.Resources.ResourceManager ResourceManager {
            get {
                if (object.ReferenceEquals(resourceMan, null)) {
                    global::System.Resources.ResourceManager temp = new global::System.Resources.ResourceManager("Overseer.Tests.Properties.Resources", typeof(Resources).Assembly);
                    resourceMan = temp;
                }
                return resourceMan;
            }
        }
        
        /// <summary>
        ///   Overrides the current thread's CurrentUICulture property for all
        ///   resource lookups using this strongly typed resource class.
        /// </summary>
        [global::System.ComponentModel.EditorBrowsableAttribute(global::System.ComponentModel.EditorBrowsableState.Advanced)]
        internal static global::System.Globalization.CultureInfo Culture {
            get {
                return resourceCulture;
            }
            set {
                resourceCulture = value;
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to {
        ///  &quot;job&quot;: {
        ///    &quot;averagePrintTime&quot;: null, 
        ///    &quot;estimatedPrintTime&quot;: null, 
        ///    &quot;filament&quot;: null, 
        ///    &quot;file&quot;: {
        ///      &quot;date&quot;: 1536869430, 
        ///      &quot;display&quot;: &quot;juggernaut.gcode&quot;, 
        ///      &quot;name&quot;: &quot;juggernaut.gcode&quot;, 
        ///      &quot;origin&quot;: &quot;local&quot;, 
        ///      &quot;path&quot;: &quot;juggernaut.gcode&quot;, 
        ///      &quot;size&quot;: 201326592
        ///    }, 
        ///    &quot;lastPrintTime&quot;: null, 
        ///    &quot;user&quot;: &quot;michael&quot;
        ///  }, 
        ///  &quot;progress&quot;: {
        ///    &quot;completion&quot;: 73.51443469524384, 
        ///    &quot;filepos&quot;: 148004106, 
        ///    &quot;printTime&quot;: 287131, 
        ///    &quot;printTimeLeft&quot;: 1 [rest of string was truncated]&quot;;.
        /// </summary>
        internal static string OctoprintJob {
            get {
                return ResourceManager.GetString("OctoprintJob", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to {
        ///  &quot;sd&quot;: {
        ///    &quot;ready&quot;: false
        ///  }, 
        ///  &quot;state&quot;: {
        ///    &quot;flags&quot;: {
        ///      &quot;cancelling&quot;: false, 
        ///      &quot;closedOrError&quot;: false, 
        ///      &quot;error&quot;: false, 
        ///      &quot;finishing&quot;: false, 
        ///      &quot;operational&quot;: true, 
        ///      &quot;paused&quot;: false, 
        ///      &quot;pausing&quot;: false, 
        ///      &quot;printing&quot;: true, 
        ///      &quot;ready&quot;: false, 
        ///      &quot;resuming&quot;: false, 
        ///      &quot;sdReady&quot;: false
        ///    }, 
        ///    &quot;text&quot;: &quot;Printing&quot;
        ///  }, 
        ///  &quot;temperature&quot;: {
        ///    &quot;bed&quot;: {
        ///      &quot;actual&quot;: 45.02, 
        ///      &quot;offset&quot;: 0, 
        ///      &quot;target&quot;: 45.0
        ///    } [rest of string was truncated]&quot;;.
        /// </summary>
        internal static string OctoprintPrinter {
            get {
                return ResourceManager.GetString("OctoprintPrinter", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to {
        ///  &quot;profiles&quot;: {
        ///    &quot;_default&quot;: {
        ///      &quot;axes&quot;: {
        ///        &quot;e&quot;: {
        ///          &quot;inverted&quot;: false, 
        ///          &quot;speed&quot;: 300
        ///        }, 
        ///        &quot;x&quot;: {
        ///          &quot;inverted&quot;: false, 
        ///          &quot;speed&quot;: 6000
        ///        }, 
        ///        &quot;y&quot;: {
        ///          &quot;inverted&quot;: false, 
        ///          &quot;speed&quot;: 6000
        ///        }, 
        ///        &quot;z&quot;: {
        ///          &quot;inverted&quot;: false, 
        ///          &quot;speed&quot;: 200
        ///        }
        ///      }, 
        ///      &quot;color&quot;: &quot;default&quot;, 
        ///      &quot;current&quot;: true, 
        ///      &quot;default&quot;: true, 
        ///      &quot;extruder&quot;: {
        ///        &quot;c [rest of string was truncated]&quot;;.
        /// </summary>
        internal static string OctoprintProfiles {
            get {
                return ResourceManager.GetString("OctoprintProfiles", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to {
        ///    &quot;api&quot;: {
        ///        &quot;allowCrossOrigin&quot;: true,
        ///        &quot;enabled&quot;: true,
        ///        &quot;key&quot;: &quot;BF06A13F36C14E2D991126DAE1FA827A&quot;
        ///    },
        ///    &quot;appearance&quot;: {
        ///        &quot;color&quot;: &quot;black&quot;,
        ///        &quot;colorTransparent&quot;: false,
        ///        &quot;defaultLanguage&quot;: &quot;_default&quot;,
        ///        &quot;name&quot;: &quot;CR-10&quot;,
        ///        &quot;showFahrenheitAlso&quot;: false
        ///    },
        ///    &quot;feature&quot;: {
        ///        &quot;autoUppercaseBlacklist&quot;: [
        ///            &quot;M117&quot;,
        ///            &quot;M118&quot;
        ///        ],
        ///        &quot;g90InfluencesExtruder&quot;: false,
        ///        &quot;gcodeViewer&quot;: true,
        ///  [rest of string was truncated]&quot;;.
        /// </summary>
        internal static string OctoprintSettings {
            get {
                return ResourceManager.GetString("OctoprintSettings", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to {
        ///	&quot;err&quot;: 0,
        ///	&quot;size&quot;: 3778348,
        ///	&quot;height&quot;: 10.10,
        ///	&quot;firstLayerHeight&quot;: 0.20,
        ///	&quot;layerHeight&quot;: 0.20,
        ///	&quot;filament&quot;: [22575.2],
        ///	&quot;generatedBy&quot;: &quot;Cura_SteamEngine 3.3.1&quot;,
        ///	&quot;printDuration&quot;: 311,
        ///	&quot;fileName&quot;: &quot;CFDMP_spidy.gcode&quot;
        ///}
        ///.
        /// </summary>
        internal static string RepRapFirmwareFileInfoFilament {
            get {
                return ResourceManager.GetString("RepRapFirmwareFileInfoFilament", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to {
        ///	&quot;err&quot;: 0,
        ///	&quot;size&quot;: 3778348,
        ///	&quot;height&quot;: 0,
        ///	&quot;firstLayerHeight&quot;: 0.20,
        ///	&quot;layerHeight&quot;: 0.20,
        ///	&quot;filament&quot;: [],
        ///	&quot;generatedBy&quot;: &quot;Cura_SteamEngine 3.3.1&quot;,
        ///	&quot;printDuration&quot;: 311,
        ///	&quot;fileName&quot;: &quot;CFDMP_spidy.gcode&quot;
        ///}
        ///.
        /// </summary>
        internal static string RepRapFirmwareFileInfoFile {
            get {
                return ResourceManager.GetString("RepRapFirmwareFileInfoFile", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to {
        ///	&quot;err&quot;: 0,
        ///	&quot;size&quot;: 3778348,
        ///	&quot;height&quot;: 10.10,
        ///	&quot;firstLayerHeight&quot;: 0.20,
        ///	&quot;layerHeight&quot;: 0.20,
        ///	&quot;filament&quot;: [],
        ///	&quot;generatedBy&quot;: &quot;Cura_SteamEngine 3.3.1&quot;,
        ///	&quot;printDuration&quot;: 311,
        ///	&quot;fileName&quot;: &quot;CFDMP_spidy.gcode&quot;
        ///}
        ///.
        /// </summary>
        internal static string RepRapFirmwareFileInfoHeight {
            get {
                return ResourceManager.GetString("RepRapFirmwareFileInfoHeight", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to {
        ///	&quot;status&quot;: &quot;P&quot;,
        ///	&quot;coords&quot;: {
        ///		&quot;axesHomed&quot;: [1, 1, 1],
        ///		&quot;xyz&quot;: [162.128, 79.418, 0.500],
        ///		&quot;machine&quot;: [161.120, 79.295, 0.500],
        ///		&quot;extr&quot;: [2374.9]
        ///	},
        ///	&quot;speeds&quot;: {
        ///		&quot;requested&quot;: 45.0,
        ///		&quot;top&quot;: 6.7
        ///	},
        ///	&quot;currentTool&quot;: 0,
        ///	&quot;params&quot;: {
        ///		&quot;atxPower&quot;: 0,
        ///		&quot;fanPercent&quot;: [0, 93, 0, 100, 100, 100, 100, 0, 0],
        ///		&quot;fanNames&quot;: [&quot;&quot;, &quot;&quot;, &quot;&quot;, &quot;&quot;, &quot;&quot;, &quot;&quot;, &quot;&quot;, &quot;&quot;, &quot;&quot;],
        ///		&quot;speedFactor&quot;: 100.0,
        ///		&quot;extrFactors&quot;: [100.0],
        ///		&quot;babystep&quot;: 0.000
        ///	},
        ///	&quot;seq&quot;: 20,
        ///	&quot;sensors&quot;: {
        ///		&quot;probeValue&quot;: 0,
        ///		&quot;fanRPM [rest of string was truncated]&quot;;.
        /// </summary>
        internal static string RepRapFirmwareStatusType2 {
            get {
                return ResourceManager.GetString("RepRapFirmwareStatusType2", resourceCulture);
            }
        }
        
        /// <summary>
        ///   Looks up a localized string similar to {
        ///	&quot;status&quot;: &quot;P&quot;,
        ///	&quot;coords&quot;: {
        ///		&quot;axesHomed&quot;: [1, 1, 1],
        ///		&quot;xyz&quot;: [79.068, 159.650, 0.500],
        ///		&quot;machine&quot;: [79.063, 159.090, 0.500],
        ///		&quot;extr&quot;: [2355.9]
        ///	},
        ///	&quot;speeds&quot;: {
        ///		&quot;requested&quot;: 45.0,
        ///		&quot;top&quot;: 45.0
        ///	},
        ///	&quot;currentTool&quot;: 0,
        ///	&quot;params&quot;: {
        ///		&quot;atxPower&quot;: 0,
        ///		&quot;fanPercent&quot;: [0, 93, 0, 100, 100, 100, 100, 0, 0],
        ///		&quot;speedFactor&quot;: 100.0,
        ///		&quot;extrFactors&quot;: [100.0],
        ///		&quot;babystep&quot;: 0.000
        ///	},
        ///	&quot;seq&quot;: 20,
        ///	&quot;sensors&quot;: {
        ///		&quot;probeValue&quot;: 0,
        ///		&quot;fanRPM&quot;: 0
        ///	},
        ///	&quot;temps&quot;: {
        ///		&quot;bed&quot;: {
        ///			&quot;current&quot;: 60 [rest of string was truncated]&quot;;.
        /// </summary>
        internal static string RepRapFirmwareStatusType3 {
            get {
                return ResourceManager.GetString("RepRapFirmwareStatusType3", resourceCulture);
            }
        }
    }
}