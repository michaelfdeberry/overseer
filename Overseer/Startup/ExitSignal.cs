using System;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Mono.Unix;

namespace Overseer.Startup
{
    /// <summary>
    /// Adapted from code found here https://stackoverflow.com/a/32716784
    /// </summary>
    public abstract class ExitSignal
    {
        public event EventHandler Exit;

        protected void RaiseExit()
        {
            Exit?.Invoke(null, EventArgs.Empty);
        }

        public static ExitSignal Create()
        {
            switch (Environment.OSVersion.Platform)
            {
                case PlatformID.Unix:
                    return new UnixExitSignal();
                default:
                    return new WinExitSignal();
            }
        }
    }

    public class UnixExitSignal : ExitSignal
    {
        readonly UnixSignal[] _signals = {
            new UnixSignal(Mono.Unix.Native.Signum.SIGTERM),
            new UnixSignal(Mono.Unix.Native.Signum.SIGINT),
            new UnixSignal(Mono.Unix.Native.Signum.SIGUSR1)
        };

        public UnixExitSignal()
        {
            Task.Run(() =>
            {
                // blocking call to wait for any kill signal
                UnixSignal.WaitAny(_signals, -1);
                RaiseExit();
            });
        }
    }


    public class WinExitSignal : ExitSignal
    {
        [DllImport("Kernel32")]
        public static extern bool SetConsoleCtrlHandler(HandlerRoutineDelagate Handler, bool Add);

        // A delegate type to be used as the handler routine
        // for SetConsoleCtrlHandler.
        public delegate bool HandlerRoutineDelagate(CtrlTypes CtrlType);

        /// <summary>
        /// Need this as a member variable to avoid it being garbage collected.
        /// </summary>
        static HandlerRoutineDelagate HandlerRoutine;

        // An enumerated type for the control messages
        // sent to the handler routine.
        public enum CtrlTypes
        {
            CTRL_C_EVENT = 0,
            CTRL_BREAK_EVENT,
            CTRL_CLOSE_EVENT,
            CTRL_LOGOFF_EVENT = 5,
            CTRL_SHUTDOWN_EVENT
        }
        
        public WinExitSignal()
        {
            HandlerRoutine = ConsoleCtrlCheck;
            SetConsoleCtrlHandler(HandlerRoutine, true);
        }

        /// <summary>
        /// Handle the ctrl types
        /// </summary>
        bool ConsoleCtrlCheck(CtrlTypes ctrlType)
        {
            switch (ctrlType)
            {
                case CtrlTypes.CTRL_C_EVENT:
                case CtrlTypes.CTRL_BREAK_EVENT:
                case CtrlTypes.CTRL_CLOSE_EVENT:
                case CtrlTypes.CTRL_LOGOFF_EVENT:
                case CtrlTypes.CTRL_SHUTDOWN_EVENT:
                    RaiseExit();
                    return true;
                default:
                    return true;
            }
        }
    }
}
