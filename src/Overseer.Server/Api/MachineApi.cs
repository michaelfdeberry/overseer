using Newtonsoft.Json.Linq;
using Overseer.Server.Integration.Machines;
using Overseer.Server.Machines;
using Overseer.Server.Models;

namespace Overseer.Server.Api
{
  public static class MachineApi
  {
    public static RouteGroupBuilder MapMachineApi(this RouteGroupBuilder builder)
    {
      var group = builder.MapGroup("/machines").WithTags("Machines");
      group.RequireAuthorization();

      group.MapGet("/", (IMachineManager machines) => Results.Ok(machines.GetMachines(maskSensitiveData: true)));

      group
        .MapPost("/", async (Machine model, IMachineManager machines) => Results.Ok(await machines.CreateMachine(model)))
        .RequireAuthorization(AccessLevel.Administrator.ToString());

      group
        .MapPut("/", async (Machine model, IMachineManager machines) => Results.Ok(await machines.UpdateMachine(model)))
        .RequireAuthorization(AccessLevel.Administrator.ToString());

      group
        .MapDelete("/{id}", (int id, IMachineManager machines) => Results.Ok(machines.DeleteMachine(id)))
        .RequireAuthorization(AccessLevel.Administrator.ToString());

      group
        .MapPost(
          "/sort",
          (List<int> order, IMachineManager machines) =>
          {
            machines.SortMachines(order);
            return Results.Ok();
          }
        )
        .RequireAuthorization(AccessLevel.Administrator.ToString());

      group.MapGet("/metadata", (IMachineManager machines) => Results.Ok(machines.GetMachineMetadata()));

      group
        .MapPost(
          "/{id}/monitoring",
          async (int id, IMachineManager machines) =>
          {
            await machines.EnableMonitoring(id);
            return Results.Ok();
          }
        )
        .RequireAuthorization(AccessLevel.Administrator.ToString());

      group
        .MapDelete(
          "/{id}/monitoring",
          async (int id, IMachineManager machines) =>
          {
            await machines.DisableMonitoring(id);
            return Results.Ok();
          }
        )
        .RequireAuthorization(AccessLevel.Administrator.ToString());

      return builder;
    }
  }
}
