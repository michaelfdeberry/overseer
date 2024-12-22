using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Overseer.Models
{
    public enum MachineToolType
    {
        Undetermined, 
        Heater,
        Extruder
    }

    public class MachineTool
    {
        public static IReadOnlyList<string> AuxiliaryHeaterTypes = new List<string> { "bed", "chamber", "cabinet" };

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public MachineToolType ToolType { get; set; }

        public int Index { get; set; }

        public string Name { get; set; }

        public MachineTool() { }

        public MachineTool(MachineToolType toolType, int index)
            : this (toolType, index, $"{toolType} {index}")
        {
        }

        public MachineTool(MachineToolType toolType, int index, string name)
        {
            ToolType = toolType;
            Index = index;
            Name = name;
        }
    }
}
