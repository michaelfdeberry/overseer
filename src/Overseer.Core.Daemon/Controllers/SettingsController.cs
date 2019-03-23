using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Overseer.Models;

namespace Overseer.Daemon.Controllers
{
    [Route("[controller]")]
    public class SettingsController : Controller
    {
        readonly IUserManager _userManager;
        readonly IMachineManager _machineManager;
        readonly IConfigurationManager _configurationManager;

        public SettingsController(IUserManager userManager, IMachineManager machineManager, IConfigurationManager configurationManager)
        {
            _userManager = userManager;
            _machineManager = machineManager;
            _configurationManager = configurationManager;
        }

        [HttpGet("bundle")]
        public ActionResult GetBundledConfiguration()
        {
            return Ok(new
            {
                Users = _userManager.GetUsers(),
                Machines = _machineManager.GetMachines(),
                Settings = _configurationManager.GetApplicationSettings()
            });
        }
        
        [HttpGet]
        public ActionResult<ApplicationSettings> GetSettings()
        {
            return _configurationManager.GetApplicationSettings();
        }
        
        [HttpPost]
        [Authorize(Roles = "Administrator")]
        public ActionResult<ApplicationSettings> UpdateSettings([FromBody]ApplicationSettings settings)
        {
            return _configurationManager.UpdateApplicationSettings(settings);
        }
        
        [HttpPut("certificate")]
        [Authorize(Roles = "Administrator")]
        public ActionResult AddCertificateExclusion([FromBody]CertificateDetails certificateDetails)
        {
            _configurationManager.AddCertificateExclusion(certificateDetails);
            return Ok();
        }

        [HttpGet("about")]
        public ActionResult<ApplicationInfo> GetApplicationInfo()
        {
            return _configurationManager.GetApplicationInfo();
        }
    }
}