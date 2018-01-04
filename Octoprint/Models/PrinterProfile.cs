using System.Collections;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Octoprint.Models
{
    public class PrinterProfileBase
    {
        public string Id { get; set; }

        public string Name { get; set; }
    }

    public class PrinterProfile : PrinterProfileBase
    {
        public string Model { get; set; }

        public string Color { get; set; }
        
        public bool Default { get; set; }

        public bool Current { get; set; }

        public string Resource { get; set; }

        public PrinterVolume Volume { get; set; }

        public bool HeatedBed { get; set; }

        public Dictionary<string, Axis> Axes { get; set; }

        public Extruder Extruder { get; set; }
    }

    public class Extruder
    {
        public float NozzelDiameter { get; set; }

        public int Count { get; set; }

        /// <summary>
        /// TODO: Create custom deserializer to load 
        /// an list of axisOffset instead of a connection of arrays
        /// </summary>
        public IEnumerable<float[]> Offsets { get; set; }
    }

    public class Axis
    {
        public int Speed { get; set; }

        public bool Inverted { get; set; }
    }

    public class AxisOffset
    {
        public int X { get; set; }

        public int Y { get; set; }
    }

    public class PrinterVolume
    {
        public string FormFactor { get; set; }

        public string Orgin { get; set; }

        public float Width { get; set; }

        public float Depth { get; set; }

        public float Height { get; set; }

        /// <summary>
        /// TODO: requires custom deserializer, this is either false or an object.
        /// Why not null? 
        /// </summary>
        //[JsonProperty("custom_box")]
        //public PrinterVolumeCustomBox CustomBox { get; set; }
    }

    public class PrinterVolumeCustomBox
    {
        [JsonProperty("min_x")]
        public float MinX { get; set; }

        [JsonProperty("max_x")]
        public float MaxX { get; set; }

        [JsonProperty("min_y")]
        public float MinY { get; set; }

        [JsonProperty("max_y")]
        public float MaxY { get; set; }

        [JsonProperty("min_z")]
        public float MinZ { get; set; }

        [JsonProperty("max_z")]
        public float MaxZ { get; set; }
    }

    public class PrinterProfileResponse
    {
        public PrinterProfile Profile { get; set; }
    }

    public class PrinterProfileList 
    {
        public Dictionary<string, PrinterProfile> Profiles { get; set; }

        //public IEnumerator<PrinterProfile> GetEnumerator()
        //{
        //    return Profiles.Values.GetEnumerator();
        //}

        //IEnumerator IEnumerable.GetEnumerator()
        //{
        //    return GetEnumerator();
        //}
    }
}