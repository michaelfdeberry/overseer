using Nancy;
using Nancy.ModelBinding;
using Newtonsoft.Json.Linq;
using Overseer.Models;
using System;
using System.IO;

namespace Overseer.Daemon.Startup
{
	public class MachineModelBinder : IModelBinder
	{
		public object Bind(NancyContext context, Type modelType, object instance, BindingConfig configuration, params string[] blackList)
		{
			using (var reader = new StreamReader(context.Request.Body))
			{
				var jObject = JObject.Parse(reader.ReadToEnd());
				var machineTypeName = jObject["machineType"].Value<string>();
				return jObject.ToObject(Machine.GetMachineType(machineTypeName));
			}
		}

		public bool CanBind(Type modelType)
		{
			return typeof(Machine).IsAssignableFrom(modelType);
		}
	}
}
