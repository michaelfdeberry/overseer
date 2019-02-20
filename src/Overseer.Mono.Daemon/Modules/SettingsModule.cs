using Nancy;
using Nancy.ModelBinding;
using Nancy.Security;
using Overseer.Models;

namespace Overseer.Daemon.Modules
{
    public class ConfigurationModule : NancyModule
    {
        public ConfigurationModule
            (
            IConfigurationManager configurationManager, 
            IMachineManager machineManager, 
            IUserManager userManager
        )
            : base("settings")
        {
            this.RequiresMSOwinAuthentication();

            Get("/bundle", p => new
            {
                Machines = machineManager.GetMachines(),
                Users = userManager.GetUsers(),
                Settings = configurationManager.GetApplicationSettings()
            });

            Get("/", p => configurationManager.GetApplicationSettings());

            Post("/", p => configurationManager.UpdateApplicationSettings(this.Bind<ApplicationSettings>()));
            
            Put("/certificate", p => configurationManager.AddCertificateExclusion(this.Bind<CertificateDetails>()));

            Get("/about", p => configurationManager.GetApplicationInfo());
        }
    }
}