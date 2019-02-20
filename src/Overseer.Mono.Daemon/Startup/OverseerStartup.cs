using log4net;
using Microsoft.AspNet.SignalR;
using Microsoft.Owin;
using Microsoft.Owin.FileSystems;
using Microsoft.Owin.Hosting;
using Microsoft.Owin.StaticFiles;
using Nancy.Owin;
using Overseer.Data;
using Overseer.Models;
using Owin;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Overseer.Daemon.Startup
{
    public class OverseerStartup
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(OverseerStartup));

        const string ClientPath = "./OverseerUI";
        const string EndPointFormatter = "http://localhost:{0}";
        
        public static void Start(IDataContext context)
        {
            Log.Info("Starting Server...");

            var settings = context.GetValueStore().Get<ApplicationSettings>();
            var endPoint = string.Format(EndPointFormatter, settings.LocalPort);

            WebApp.Start(endPoint, app =>
            {
                app.UseOverseerAuthentication();

                app.MapSignalR("/push", new HubConfiguration
                {
                    EnableDetailedErrors = true,
                    EnableJavaScriptProxies = true,
                    EnableJSONP = false
                });
                
                app.Map("/api", a =>
                {
                    a.UseNancy(new NancyOptions { Bootstrapper = new OverseerBootstrapper(context) });
                });

                app.Use(RedirectToWebApp);

                app.UseFileServer(new FileServerOptions
                {
                    EnableDirectoryBrowsing = false,
                    EnableDefaultFiles = true,
                    DefaultFilesOptions = { DefaultFileNames = { "index.html" } },
                    FileSystem = new PhysicalFileSystem(ClientPath),
                    StaticFileOptions = { ContentTypeProvider = new OverseerContentTypeProvider() }
                });
            });

            Log.Info($"Listening at {endPoint}...");
        }
        
        /// <summary>
        /// This is needed to support client side routing without the use of hash bang urls.
        /// 
        /// If the request wasn't for a file, an api request, or a signalr request then redirect to the root to be handled by index.html
        /// </summary>
        static async Task RedirectToWebApp(IOwinContext context, Func<Task> next)
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
        }
    }
}