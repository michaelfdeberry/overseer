using log4net;
using System.Threading;

namespace Overseer.Daemon
{
    class Program
    {
        static readonly ILog Log = LogManager.GetLogger(typeof(Program));

        static void Main(string[] args)
        {
            Log.Info("Starting Overseer...");

            var waitHandle = new EventWaitHandle(false, EventResetMode.ManualReset);

            using (var launcher = new Launcher())
            {        
                var exitSignal = ExitSignal.Create();
                exitSignal.Exit += (sender, eventArgs) =>
                {
                    Log.Info("Received Exit Signal...");
                    waitHandle.Set();
                };

                Startup.Start(launcher.Launch(args), launcher.Bootstrapper);
                waitHandle.WaitOne();

                Log.Info("Exiting Overseer");
            }
        }
    }
}
