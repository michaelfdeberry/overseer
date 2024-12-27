using log4net;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.SignalR;
using Overseer.Data;
using Overseer.Machines;
using Overseer.Models;
using Overseer.Server.Hubs;
using System.Net;

namespace Overseer.Server
{
    public static class Extensions
    {
        readonly static ILog Log = LogManager.GetLogger("Overseer.Server");

        public static IServiceCollection AddOverseerDependencies(this IServiceCollection services, IDataContext context)
        {            
            services.AddSingleton(context);
            services.AddSingleton<Func<Machine, IMachineProvider>>((IServiceProvider provider) => machine =>
            {
                var machineType = MachineProviderManager.GetProviderType(machine) ?? throw new Exception("Unable to get machine type");
                var provider = (IMachineProvider?)Activator.CreateInstance(machineType, machine) ?? throw new Exception("Unable to create provider");
                return provider;
            });
            services.AddTransient<IAuthenticationManager, AuthenticationManager>();
            services.AddTransient<IAuthorizationManager, AuthorizationManager>();
            services.AddTransient<IConfigurationManager, ConfigurationManager>();
            services.AddTransient<IUserManager, UserManager>();
            services.AddTransient<IMachineManager, MachineManager>();
            services.AddTransient<IControlManager, ControlManager>();
            services.AddSingleton<IMonitoringService, MonitoringService>();
            services.AddSingleton<MachineProviderManager>();
            services.AddCors();

            return services;
        }

        public static WebApplication LinkMonitorToStatusHub(this WebApplication app)
        { 
            var hubContext = app.Services.GetRequiredService<IHubContext<StatusHub>>();
            var monitoringService = app.Services.GetRequiredService<IMonitoringService>();

            monitoringService.StatusUpdate += (object? sender, EventArgs<MachineStatus> e) =>
            {
                hubContext
                    .Clients
                    .Group(StatusHub.MonitoringGroupName)
                    .SendAsync("StatusUpdate", e.Data);
            };

            return app;
        }

        public static WebApplication HandleOverseerExceptions(this WebApplication app)
        {

            app.UseExceptionHandler(builder =>
            {
                builder.Run(async context =>
                {
                    var exception = context.Features.Get<IExceptionHandlerFeature>()!.Error;
                    if (exception != null)
                    {
                        Log.Error("Server Error", exception);
                        if (exception.InnerException != null)
                        {
                            exception = exception.InnerException;
                        }

                        object exceptionModel = exception is OverseerException oEx ?
                            exceptionModel = new { message = oEx.Message, oEx.Properties, exceptionType = "overseer" } :
                            exceptionModel = new { message = exception.Message };

                        context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                        context.Response.ContentType = "application/json";
                        await context.Response.WriteAsJsonAsync(exceptionModel);
                    }
                });
            });

            return app;
        }
    }
}
