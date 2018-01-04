using log4net;
using Microsoft.AspNet.SignalR;
using Microsoft.Owin.FileSystems;
using Microsoft.Owin.Hosting;
using Microsoft.Owin.StaticFiles;
using Nancy.Owin;
using Newtonsoft.Json;
using Overseer.Core;
using Overseer.Core.Data;
using Overseer.Hubs;
using Owin;

namespace Overseer.Startup
{
    public class OverseerStartup
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(OverseerStartup));
#if DEBUG
        //When built in debug mode use the dev files and host on localhost
        const string ClientPath = "../Overseer/Client";        
        const string EndPointFormatter = "http://localhost:{0}";
#else 
        //When build in release mode use the files in the output folder and dynamic host
        const string ClientPath = "./Client";
        const string EndPointFormatter = "http://*:{0}";
#endif

        public static void Start(IDataContext context)
        {
            Log.Info("Starting Server...");

            var settings = context.GetApplicationSettings();
            var endPoint = string.Format(EndPointFormatter, settings.LocalPort);
            WebApp.Start(endPoint, app =>
            {
                GlobalHost.DependencyResolver.Register(typeof(StatusHub), () => OverseerBootstrapper.Container.Resolve<StatusHub>());
                GlobalHost.DependencyResolver.Register(typeof(JsonSerializer), () => OverseerBootstrapper.Container.Resolve<JsonSerializer>());
                
                app.UseFileServer(new FileServerOptions
                {
                    EnableDirectoryBrowsing = false,
                    EnableDefaultFiles = true,
                    DefaultFilesOptions = { DefaultFileNames = { "index.html" } },
                    FileSystem = new PhysicalFileSystem(ClientPath),
                    StaticFileOptions = { ContentTypeProvider = new OverseerContentTypeProvider() }
                });

                app.MapSignalR("/push", new HubConfiguration
                {
                    EnableDetailedErrors = true,
                    EnableJavaScriptProxies = true,
                    EnableJSONP = false
                });

                app.UseNancy(new NancyOptions { Bootstrapper = new OverseerBootstrapper(context) });
            });

            Log.Info($"Listening at {endPoint}...");
        }
    }
}