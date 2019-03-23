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

            Get("/bundle", p => {
                return new
                {
                    Machines = machineManager.GetMachines(),
                    Users = userManager.GetUsers(),
                    Settings = configurationManager.GetApplicationSettings()
                };
            });

            Get("/", p => 
            {
                return configurationManager.GetApplicationSettings();
            });

            Post("/", p =>
            {
                this.RequireAdmin();

                return configurationManager.UpdateApplicationSettings(this.Bind<ApplicationSettings>());
            });
            
            Put("/certificate", p => 
            {
                this.RequireAdmin();

                return configurationManager.AddCertificateExclusion(this.Bind<CertificateDetails>());
            });

            Get("/about", p => {
                return configurationManager.GetApplicationInfo();
            });
        }
    }
}