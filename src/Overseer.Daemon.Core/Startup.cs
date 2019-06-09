using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Nancy.Owin;
using Newtonsoft.Json;
using Overseer.Daemon.Bootstrapping;
using Overseer.Daemon.Hubs;
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

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddSpaStaticFiles(configuration =>
            {
                // In production, the Angular files will be served from this directory
                configuration.RootPath = "OverseerUI";                
            });

            services.AddAuthentication(OverseerAuthenticationOptions.Setup)
                .UseOverseerAuthentication();

            services.AddSignalR().AddJsonProtocol(options => 
            {
                options.PayloadSerializerSettings.NullValueHandling = NullValueHandling.Ignore;
            });            
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, OverseerBootstrapper bootstrapper, IHubContext<StatusHub> statusHub)
        {
            bootstrapper.Container.Register<Action<MachineStatus>>((c, n) =>
            {
                return status => StatusHub.PushStatusUpdate(statusHub, status);
            });

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseSpaStaticFiles();

            app.Map("/api", builder =>
            {
                builder.UseAuthentication();
                builder.UseOwin(owin => owin.UseNancy(options => options.Bootstrapper = bootstrapper));
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
        }
    }
}
