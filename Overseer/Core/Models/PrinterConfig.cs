using System;
using System.Collections.Generic;

namespace Overseer.Core.Models
{
    public abstract class PrinterConfig
    {
        public abstract PrinterType PrinterType { get; }

        public string WebCamUrl { get; set; }

        public string SnapshotUrl { get; set; }

        public bool HeatedBed { get; set; }

        public List<string> Tools { get; set; }

        public static Type GetConfigType(PrinterType printerType)
        {
            var configType = Type.GetType($"Overseer.Core.Models.{printerType}Config");
            if (configType == null) throw new ArgumentOutOfRangeException(nameof(printerType), "Unknown Printer Type");

            return configType;
        }
    }
}