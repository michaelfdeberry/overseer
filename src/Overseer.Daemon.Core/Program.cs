using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using Overseer.Daemon.Hubs;

namespace Overseer.Daemon
{
    public class Program
    {
        public static void Main(string[] args)
        {
            using (var launcher = new Launcher())
            {
                WebHost
                    .CreateDefaultBuilder(args)
                    .UseUrls(new[] { launcher.Launch(args) })
                    .ConfigureLogging((hostingContext, logging) =>
                    {
                        logging.AddLog4Net();
                        logging.SetMinimumLevel(LogLevel.Debug);
                    })
                    .ConfigureServices(services => 
                    {
                        services.AddSingleton(launcher.Bootstrapper);
                        services.AddTransient(s => launcher.Bootstrapper.Container.Resolve<IAuthorizationManager>());
                        services.AddTransient(s => launcher.Bootstrapper.Container.Resolve<StatusHubService>());
                    })
                    .UseStartup<Startup>()
                    .Build()
                    .Run();
            }
        }
    }
}
