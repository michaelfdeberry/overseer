using System.Threading.Tasks;

namespace Overseer
{
    public interface IControlManager
    {
        Task Cancel(int machineId);
        Task Pause(int machineId);
        Task Resume(int machineId);
        Task SetFanSpeed(int machineId, int percentage);
        Task SetFeedRate(int machineId, int feedRate);
        Task SetFlowRate(int machineId, int extruderIndex, int flowRate);
        Task SetTemperature(int machineId, int heaterIndex, int temperature);
    }
}