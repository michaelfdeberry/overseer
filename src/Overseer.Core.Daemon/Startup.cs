using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Overseer.Daemon.Bootstrapping;
using Overseer.Daemon.Hubs;
using Overseer.Data;
using Overseer.Machines;
using Overseer.Models;
using System;

namespace Overseer.Daemon
{
    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;        
        }

        public static JsonSerializerSettings ConfigureJsonSerializer(JsonSerializerSettings settings)
        {
            settings.Converters.Add(new MachineJsonConverter());
            settings.NullValueHandling = NullValueHandling.Ignore;

            return settings;
        }

        void ConfigureApplicationDependencies(IServiceCollection services)
        {
            services.AddSingleton(s => Program.DataContext);
            services.AddSingleton<CertificateExceptionHandler>();            

            services.AddTransient<IUserManager, UserManager>();
            services.AddTransient<IMachineManager, MachineManager>();
            services.AddTransient<IControlManager, ControlManager>();
            services.AddTransient<IConfigurationManager, ConfigurationManager>();    

            ////printer provider factory, used by the printer provider manager to create provider instances
            services.AddSingleton<Func<Machine, IMachineProvider>>(s => machine =>
            {
                var machineType = MachineProviderManager.GetProviderType(machine);
                var provider = (IMachineProvider)Activator.CreateInstance(machineType, machine);

                return provider;
            });

            services.AddSingleton<MachineProviderManager>();

            services.AddSingleton<IMonitoringService>(s =>
            {
                //wire up the event to push the updates with signalr when the monitoring service is created.
                var machines = s.GetService<IMachineManager>();
                var configuration = s.GetService<IConfigurationManager>();
                var providers = s.GetService<MachineProviderManager>();
                var monitoringService = new MonitoringService(machines, configuration, providers);

                monitoringService.StatusUpdate += (sender, args) =>
                {
                    var hubContext = s.GetService<IHubContext<StatusHub>>();
                    StatusHub.PushStatusUpdate(hubContext, args.Data);
                };

                return monitoringService;
            });
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            ConfigureApplicationDependencies(services);

            // In production, the Angular files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {                
                configuration.RootPath = "OverseerUI";                
            });

            services.AddAuthentication(OverseerAuthenticationOptions.Setup)
                .UseOverseerAuthentication();

            services.AddMvc(config => 
            {
                var policy = new AuthorizationPolicyBuilder()
                    .RequireAuthenticatedUser()
                    .Build();

                config.Filters.Add(new AuthorizeFilter(policy));
            })
                .SetCompatibilityVersion(CompatibilityVersion.Version_2_1)
                .AddJsonOptions(options => ConfigureJsonSerializer(options.SerializerSettings));

            services.AddSignalR()
                .AddJsonProtocol(options => ConfigureJsonSerializer(options.PayloadSerializerSettings));
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(
            IApplicationBuilder app, 
            IHostingEnvironment env, 
            CertificateExceptionHandler certExceptionHandler,
            IDataContext context)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseSpaStaticFiles();

            app.Map("/api", builder =>
            {
                builder.UseMiddleware<OverseerErrorHandler>();
                builder.UseAuthentication();
                builder.UseMvc();
            });

            app.Map("/push", builder =>
            {
                builder.UseSignalR(routes =>
                {
                    routes.MapHub<StatusHub>("/status");
                });
            });

            app.UseSpa(spa =>
            {                
                if (env.IsDevelopment())
                {
                    spa.Options.SourcePath = "../OverseerUI";
                    spa.UseAngularCliServer(npmScript: "start");
                }
                else
                {
                    spa.Options.SourcePath = "/OverseerUI";
                }
            });
            
            certExceptionHandler.Initialize();
        }
    }
}
