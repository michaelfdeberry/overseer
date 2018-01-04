using Overseer.Core.Data;

namespace Overseer.Core.Models
{
    public class Printer : IEntity
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public bool Disabled { get; set; }

        public PrinterType PrinterType { get; set; }

        public PrinterConfig Config { get; set; }
    }
}