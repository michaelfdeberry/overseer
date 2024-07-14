using Newtonsoft.Json.Linq;
using Overseer.Models;

namespace Overseer.Server.Api
{
    public static class MachineApi
    {
        public class MachineBindingModel : Machine
        {
            public override MachineType MachineType { get; } = MachineType.Unknown;

            public static ValueTask<MachineBindingModel?> BindAsync(HttpContext context)
            {
                using var reader = new StreamReader(context.Request.Body);
                var jObject = JObject.Parse(reader.ReadToEnd());
                string machineTypeName = jObject["machineType"]?.Value<string>() ?? "Unknown"; 
                return ValueTask.FromResult(jObject.ToObject(GetMachineType(machineTypeName)) as MachineBindingModel);
            }
        }

        public static RouteGroupBuilder MapMachineApi(this RouteGroupBuilder builder)
        {
            var group = builder.MapGroup("/machines");
            group.RequireAuthorization();

            group.MapGet("/", (IMachineManager machines) => Results.Ok(machines.GetMachines()));    

            group.MapGet("/{id}", (int id, IMachineManager machines) => Results.Ok(machines.GetMachine(id)));

            group.MapPut("/", (MachineBindingModel machine, IMachineManager machines) => Results.Ok(machines.CreateMachine(machine)))
                .RequireAuthorization(AccessLevel.Administrator.ToString());

            group.MapPost("/", (MachineBindingModel machine, IMachineManager machines) => Results.Ok(machines.UpdateMachine(machine)))
                .RequireAuthorization(AccessLevel.Administrator.ToString());

            group.MapDelete("/{id}", (int id, IMachineManager machines) => Results.Ok(machines.DeleteMachine(id)))
                .RequireAuthorization(AccessLevel.Administrator.ToString());

            group.MapPost("/sort", (List<int> order, IMachineManager machines) =>
            {
                machines.SortMachines(order);
                return Results.Ok();
            })
                .RequireAuthorization(AccessLevel.Administrator.ToString());

            return builder;
        }
    }
}
