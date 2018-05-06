using System;
using Nancy;
using Nancy.ModelBinding;
using Overseer.Core;
using Overseer.Core.Models;

namespace Overseer.Modules
{
    public class ConfigurationModule : NancyModule
    {
        public ConfigurationModule(ConfigurationManager configurationManager)
            : base("services/config")
        {
            this.RequiresAuthentication();

            Get["/"] = p => configurationManager.GetPrinters();

            Get["/{id:int}"] = p => configurationManager.GetPrinter(p.id);

            Put["/", true] = async (p, ct) => await configurationManager.CreatePrinter(this.Bind<Printer>());

            Post["/", true] = async (p, ct) => await configurationManager.UpdatePrinter(this.Bind<Printer>());

            Delete["/{id:int}"] = p => this.Ok((Action)(() => configurationManager.DeletePrinter(p.id)));

            Get["/settings"] = p => configurationManager.GetApplicationSettings();

            Post["/settings"] = p => configurationManager.UpdateApplicationSettings(this.Bind<ApplicationSettings>());

            Get["/users"] = p => configurationManager.GetUsers();

            Get["/configuration"] = p => new
            {
                Printers = configurationManager.GetPrinters(),
                Users = configurationManager.GetUsers(),
                Settings = configurationManager.GetApplicationSettings()
            };

            Put["/users"] = p =>
            {
                var model = this.Bind<UserAuthentication>();
                return configurationManager.CreateUser(model.Username, model.Password);
            };

            Post["/users"] = p => //change password
            {
                var model = this.Bind<UserAuthentication>();
                configurationManager.DeleteUser(model.Id);
                return configurationManager.CreateUser(model.Username, model.Password);
            };

            Delete["/users/{id:int}"] = p => this.Ok((Action)(() => configurationManager.DeleteUser(p.id)));
        }
    }
}