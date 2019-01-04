using Fclp;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Overseer.Data;
using Overseer.Models;
using System;

namespace Overseer.Daemon
{
	public class Program
	{
		public static IDataContext DataContext { get; private set; }

		public static void Main(string[] args)
		{
			if (!UpdateManager.Update())
			{
				Environment.Exit(1);
				return;
			}

			using (var context = new LiteDataContext())
			{
				DataContext = context;
				CreateWebHostBuilder(args).Build().Run();
			}			
		}

		public static IWebHostBuilder CreateWebHostBuilder(string[] args) {			
			var valueStore = DataContext.GetValueStore();
			var appSettings = valueStore.Get<ApplicationSettings>();
			var parser = new FluentCommandLineParser();
			parser.Setup<int>("port").Callback(port => appSettings.LocalPort = port);
			parser.Setup<int>("interval").Callback(interval => appSettings.Interval = interval);
			parser.Parse(args);
			valueStore.Put(appSettings);

			return WebHost.CreateDefaultBuilder(args)
				.UseStartup<Startup>()
				.UseUrls(new[] { $"http://localhost:{appSettings.LocalPort}/" })
				.ConfigureLogging((hostingContext, logging) =>
				{
					logging.AddLog4Net();
					logging.SetMinimumLevel(LogLevel.Debug);
				});
		}
	}
}
