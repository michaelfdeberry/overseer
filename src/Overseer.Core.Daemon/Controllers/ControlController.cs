using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Overseer.Daemon.Controllers
{
    [Route("[controller]")]
    [Authorize(Roles = "Administrator")]
    public class ControlController : Controller
    {
        readonly IControlManager _controlManager;

        public ControlController(IControlManager controlManager)
        {
            _controlManager = controlManager;
        }
        
        [HttpGet("{machineId}/pause")]
        public async Task<ActionResult> Pause(int machineId)
        {
            await _controlManager.Pause(machineId);
            return Ok();
        }
        
        [HttpGet("{machineId}/resume")]
        public async Task<ActionResult> Resume(int machineId)
        {
            await _controlManager.Resume(machineId);
            return Ok();
        }

        [HttpGet("{machineId}/cancel")]
        public async Task<ActionResult> Cancel(int machineId)
        {
            await _controlManager.Cancel(machineId);
            return Ok();
        }
        
        [HttpGet("{machineId}/feed/{rate}")]
        public async Task<ActionResult> SetFeedRate(int machineId, int rate)
        {
            await _controlManager.SetFeedRate(machineId, rate);
            return Ok();
        }

        [HttpGet("{machineId}/fan/{speed}")]
        public async Task<ActionResult> SetFanSpeed(int machineId, int speed)
        {
            await _controlManager.SetFanSpeed(machineId, speed);
            return Ok();
        }

        [HttpGet("{machineId}/{heaterIndex}/temp/{value}")]
        public async Task<ActionResult> SetTemperature(int machineId, int heaterIndex, int value)
        {
            await _controlManager.SetTemperature(machineId, heaterIndex, value);
            return Ok();
        }

        [HttpGet("{machineId}/{extruderIndex}/flow/{rate}")]
        public async Task<ActionResult> SetFlowRate(int machineId, int extruderIndex, int rate)
        {
            await _controlManager.SetFlowRate(machineId, extruderIndex, rate);
            return Ok();
        }
    }
}
