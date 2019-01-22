using Newtonsoft.Json;
using Overseer.Data;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;

namespace Overseer.Models
{
	public enum MachineType
	{
		Unknown,
		Octoprint,
		RepRapFirmware
	}

	public abstract class Machine : IEntity
	{
		static readonly Lazy<ConcurrentDictionary<MachineType, Type>> _machineTypeMap = new Lazy<ConcurrentDictionary<MachineType, Type>>(() =>
		{
			var mapping = typeof(Machine).GetAssignableTypes()
				.ToDictionary(type => ((Machine)Activator.CreateInstance(type)).MachineType);

			return new ConcurrentDictionary<MachineType, Type>(mapping);
		});
        
		public int Id { get; set; }

		public string Name { get; set; }

		public bool Disabled { get; set; }

		public string WebCamUrl { get; set; }

		public string SnapshotUrl { get; set; }

		public IEnumerable<MachineTool> Tools { get; set; } = new List<MachineTool>();

		public abstract MachineType MachineType { get; }

		public MachineTool GetHeater(int heaterIndex)
		{
			return GetTool(MachineToolType.Heater, heaterIndex);
		}

		public MachineTool GetExtruder(int extruderIndex)
		{
			return GetTool(MachineToolType.Extruder, extruderIndex);
		}

		public MachineTool GetTool(MachineToolType machineToolType, int index)
		{
			return Tools.FirstOrDefault(tool => tool.ToolType == machineToolType && tool.Index == index);
		}

		public static Type GetMachineType(string machineTypeName)
		{
			var machineType = (MachineType)Enum.Parse(typeof(MachineType), machineTypeName, ignoreCase: true);
			if (_machineTypeMap.Value.TryGetValue(machineType, out Type type)) return type;

			throw new InvalidOperationException("Invalid Machine Type");
		}
     }

	public interface IRestMachine
	{
		string Url { get; set; }		

		string ClientCertificate { get; set; }

		Dictionary<string, string> Headers { get; }
	}

	public class OctoprintMachine : Machine, IRestMachine
	{
		public override MachineType MachineType => MachineType.Octoprint;

		public string ApiKey { get; set; }

		public string ProfileName { get; set; }

		public Dictionary<string, string> AvailableProfiles { get; set; } = new Dictionary<string, string>();
		
		public string Url { get; set; }

		public string ClientCertificate { get; set; }

		[JsonIgnore]
		public Dictionary<string, string> Headers => new Dictionary<string, string> { { "X-Api-Key", ApiKey } };
	}

	public class RepRapFirmwareMachine : Machine, IRestMachine
	{
		public override MachineType MachineType => MachineType.RepRapFirmware;

		public bool RequiresPassword { get; set; }

		public string Password { get; set; }

		public string Url { get; set; }

		public string ClientCertificate { get; set; }

		[JsonIgnore]
		public Dictionary<string, string> Headers => new Dictionary<string, string>();
	}
}