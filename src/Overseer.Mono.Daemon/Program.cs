using Fclp;
using log4net;
using Overseer.Daemon.Startup;
using Overseer.Data;
using Overseer.Models;
using System;
using System.Threading;

namespace Overseer.Daemon
{
	class Program
	{
		static readonly ILog Log = LogManager.GetLogger(typeof(Program));

		static void ExitApplication(int exitCode)
		{
			Log.Info("Exiting Overseer");
			Environment.Exit(exitCode);
		}

		static void Main(string[] args)
		{
			Log.Info("Starting Overseer...");

			if (!UpdateManager.Update())
			{
				ExitApplication(1);
				return;
			}

			var waitHandle = new EventWaitHandle(false, EventResetMode.ManualReset);

			using (var context = new LiteDataContext())
			{		
				var exitSignal = ExitSignal.Create();
				exitSignal.Exit += (sender, eventArgs) =>
				{
					Log.Info("Received Exit Signal...");
					waitHandle.Set();
				};

				try
				{
					var valueStore = context.GetValueStore();
					var settings = valueStore.Get<ApplicationSettings>();
					var parser = new FluentCommandLineParser();
					parser.Setup<int>("port").Callback(port => settings.LocalPort = port);
					parser.Setup<int>("interval").Callback(interval => settings.Interval = interval);
					parser.Parse(args);
					
					valueStore.Put(settings);
					OverseerStartup.Start(context);
				}
				catch (Exception ex)
				{
					Log.Error("Application Failure", ex);
				}

				waitHandle.WaitOne();
				ExitApplication(0);
			}
		}
	}
}
