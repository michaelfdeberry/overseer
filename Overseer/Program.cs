using Fclp;
using log4net;
using Overseer.Core;
using Overseer.Core.Data;
using Overseer.Startup;
using System;
using System.Threading;

namespace Overseer
{
    class Program
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(Program));

        static void Main(string[] args)
        {
            Log.Info("Starting Overseer...");
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
                    var settings = context.GetApplicationSettings();
                    var parser = new FluentCommandLineParser();
                    parser.Setup<int>("port").Callback(port => settings.LocalPort = port);
                    parser.Setup<int>("interval").Callback(interval => settings.Interval = interval);
                    parser.Parse(args);

                    context.UpdateApplicationSettings(settings);
                    OverseerStartup.Start(context);
                }
                catch (Exception ex)
                {
                    Log.Error("Application Failure", ex);
                }
                
                waitHandle.WaitOne();

                Log.Info("Exiting Overseer");
                Environment.Exit(0);
            }
        }
    }
}