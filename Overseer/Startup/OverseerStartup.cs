using log4net;
using Microsoft.AspNet.SignalR;
using Microsoft.Owin;
using Microsoft.Owin.FileSystems;
using Microsoft.Owin.Hosting;
using Microsoft.Owin.StaticFiles;
using Nancy.Owin;
using Newtonsoft.Json;
using Overseer.Core;
using Overseer.Core.Data;
using Overseer.Core.Exceptions;
using Overseer.Core.Models;
using Overseer.Hubs;
using Owin;
using System;
using System.IO;
using System.Net;
using System.Net.Security;
using System.Threading.Tasks;

namespace Overseer.Startup
{
    public class OverseerStartup
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(OverseerStartup));

        const string ClientPath = "./OverseerUI/";        

#if DEBUG
        //When built in debug mode use localhost    
        const string EndPointFormatter = "http://localhost:{0}";
#else
        //When built in release mode use dynamic host
        const string EndPointFormatter = "http://*:{0}";
#endif 

        public static void Start(IDataContext context)
        {
            Log.Info("Starting Server...");

            ServicePointManager.ServerCertificateValidationCallback += (sender, certificate, chain, errors) =>
            {
                if (errors == SslPolicyErrors.None) return true;

                var certificateDetails = new CertificateDetails(certificate);
                var thumbprint = certificateDetails.Thumbprint;
                var exceptions = context.GetRepository<CertificateException>();

                if (exceptions.Exist(x => x.Thumbprint == thumbprint)) return true;

                Log.Error($"Invalid Certificate: {certificateDetails}");
                throw new OverseerException("certificate_exception", certificateDetails);
            };

            var settings = context.GetApplicationSettings();
            var endPoint = string.Format(EndPointFormatter, settings.LocalPort);

            WebApp.Start(endPoint, app =>
            {
                GlobalHost.DependencyResolver.Register(typeof(StatusHub), () => OverseerBootstrapper.Container.Resolve<StatusHub>());
                GlobalHost.DependencyResolver.Register(typeof(JsonSerializer), () => OverseerBootstrapper.Container.Resolve<JsonSerializer>());

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