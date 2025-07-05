using Overseer.Server.Machines;
using Overseer.Server.Models;
using Overseer.Server.Users;
using IConfigurationManager = Overseer.Server.Settings.IConfigurationManager;

namespace Overseer.Server.Api
{
  public static class ConfigurationApi
  {
    public static RouteGroupBuilder MapConfigurationApi(this RouteGroupBuilder builder)
    {
      var group = builder.MapGroup("/settings");
      group.RequireAuthorization();

      group.MapGet(
        "/bundle",
        (IConfigurationManager configuration, IMachineManager machines, IUserManager users) =>
        {
          return Results.Ok(
            new
            {
              Machines = machines.GetMachines(),
              Users = users.GetUsers(),
              Settings = configuration.GetApplicationSettings(),
            }
          );
        }
      );

      group.MapGet("/", (IConfigurationManager configuration) => Results.Ok(configuration.GetApplicationSettings()));

      group
        .MapPut(
          "/",
          (ApplicationSettings settings, IConfigurationManager configuration) => Results.Ok(configuration.UpdateApplicationSettings(settings))
        )
        .RequireAuthorization(AccessLevel.Administrator.ToString());

      group
        .MapPost(
          "/certificate",
          (CertificateDetails certificate, IConfigurationManager configuration) => Results.Ok(configuration.AddCertificateExclusion(certificate))
        )
        .RequireAuthorization(AccessLevel.Administrator.ToString());

      group.MapGet("/about", (IConfigurationManager configuration) => Results.Ok(configuration.GetApplicationInfo()));

      return builder;
    }
  }
}
