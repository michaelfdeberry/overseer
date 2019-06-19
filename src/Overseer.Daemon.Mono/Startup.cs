using log4net;
using Microsoft.AspNet.SignalR;
using Microsoft.Owin;
using Microsoft.Owin.FileSystems;
using Microsoft.Owin.Hosting;
using Microsoft.Owin.StaticFiles;
using Nancy.Owin;
using Newtonsoft.Json;
using Overseer.Daemon.Bootstrapping;
using Overseer.Daemon.Hubs;
using Overseer.Models;
using Owin;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Overseer.Daemon
{
    public class Startup
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(Startup));

        const string ClientPath = "./OverseerUI";

        public static void Start(string endpoint, OverseerBootstrapper bootstrapper)
        {
            Log.Info("Starting Server...");

            bootstrapper.Container.Register<StatusHubService>();
            bootstrapper.Container.Register<Action<MachineStatus>>(s => StatusHub.PushStatusUpdate(s));

            GlobalHost.DependencyResolver.Register(typeof(StatusHub), () =>
            {
                return bootstrapper.Container.Resolve<StatusHub>();
            });

            GlobalHost.DependencyResolver.Register(typeof(JsonSerializer), () =>
            {
                return new JsonSerializer
                {
                    ContractResolver = new OverseerContractResolver(),
                    Formatting = Formatting.None
                };
            });

            WebApp.Start(endpoint, app =>
            {     
                app.UseOverseerAuthentication(bootstrapper.Container);

                app.MapSignalR("/push", new HubConfiguration
                {
                    EnableDetailedErrors = true,
                    EnableJavaScriptProxies = true,
                    EnableJSONP = false
                });

                app.Map("/api", a =>
                {
                    a.UseNancy(new NancyOptions { Bootstrapper = bootstrapper });
                });

                /*
                 * This is needed to support client side routing without the use of hash bang urls.
                 * If the request wasn't for a file, an api request, or a signalr request then redirect to the root to be handled by index.html
                 */
                app.Use(async (IOwinContext context, Func<Task> next) =>
                {
                    await next.Invoke();

                    if (context.Response.StatusCode == 404 &&
                        !Path.HasExtension(context.Request.Path.Value) &&
                        !context.Request.Path.Value.StartsWith("/push") &&
                        !context.Request.Path.Value.StartsWith("/api"))
                    {
                        context.Request.Path = new PathString("/index.html");
                        await next.Invoke();
                    }
                });

                app.UseFileServer(new FileServerOptions
                {
                    EnableDirectoryBrowsing = false,
                    EnableDefaultFiles = true,
                    DefaultFilesOptions = { DefaultFileNames = { "index.html" } },
                    FileSystem = new PhysicalFileSystem(ClientPath),
                    StaticFileOptions = { ContentTypeProvider = new OverseerContentTypeProvider() }
                });
            });

            Log.Info($"Listening at {endpoint}...");
        }
    }
}
