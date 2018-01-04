using System;
using System.Threading;
using System.Threading.Tasks;
using Fclp;
using log4net;
using Overseer.Core;
using Overseer.Core.Data;
using Overseer.Startup;

namespace Overseer
{
    class Program
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(Program));

        static void Main(string[] args)
        {
            var waitHandle = new EventWaitHandle(false, EventResetMode.ManualReset);
            var cancellation = new CancellationTokenSource();
            var context = new LiteDataContext();            

            var exitSignal = ExitSignal.Create();
            exitSignal.Exit += (sender, eventArgs) =>
            {
                cancellation.Cancel();
                waitHandle.Set();
            };    
            
            Task.Run(() =>
            {
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
            }, cancellation.Token);
            
            waitHandle.WaitOne();

            context.Dispose();
            cancellation.Dispose();
        }
    }
}