using Microsoft.AspNetCore.Mvc;
using Overseer.Models;
using System.Text.RegularExpressions;

namespace Overseer.Server.Api
{
    public static class ControlApi
    {
        public static RouteGroupBuilder MapControlApi(this RouteGroupBuilder builder)
        {
            var group = builder.MapGroup("/control");
            group.RequireAuthorization(AccessLevel.Administrator.ToString());

            group.MapPost("/{id}/pause", async (int id, IControlManager control) =>
            {
                await control.Pause(id);
                return Results.Ok();
            });

            group.MapPost("/{id}/resume", async (int id, IControlManager control) =>
            {
                await control.Resume(id);
                return Results.Ok();
            });

            group.MapPost("/{id}/cancel", async (int id, IControlManager control) =>
            {
                await control.Cancel(id);
                return Results.Ok();
            });

            group.MapPost("/{id}/feed/{value}", async (int id, int value, IControlManager control) =>
            {
                await control.SetFeedRate(id, value);
                return Results.Ok();
            });

            group.MapPost("/{id}/fan/{value}", async (int id, int value, IControlManager control) =>
            {
                await control.SetFanSpeed(id, value);
                return Results.Ok();
            });

            group.MapPost("/{id}/{tool}/temp/{value}", async (int id, int tool, int value, IControlManager control) =>
            {
                await control.SetTemperature(id, tool, value);
                return Results.Ok();
            });

            group.MapPost("/{id}/{tool}/flow/{value}", async (int id, int tool, int value, IControlManager control) =>
            {
                await control.SetFlowRate(id, tool, value);
                return Results.Ok();
            });

            return group;
        }
    }
}
