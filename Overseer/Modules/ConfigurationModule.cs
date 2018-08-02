using System;
using Nancy;
using Nancy.ModelBinding;
using Overseer.Core;
using Overseer.Core.Models;

namespace Overseer.Modules
{
    public class ConfigurationModule : NancyModule
    {
        public ConfigurationModule(ConfigurationManager configurationManager, PrinterManager printerManager, UserManager userManager)
            : base("services/config")
        {
            this.RequiresAuthentication();

            Get["/"] = p => printerManager.GetPrinters();

            Get["/{id:int}"] = p => printerManager.GetPrinter(p.id);

            Put["/", true] = async (p, ct) => await printerManager.CreatePrinter(this.Bind<Printer>());

            Post["/", true] = async (p, ct) => await printerManager.UpdatePrinter(this.Bind<Printer>());

            Delete["/{id:int}"] = p => this.Ok((Action)(() => printerManager.DeletePrinter(p.id)));

            Get["/settings"] = p => configurationManager.GetApplicationSettings();

            Post["/settings"] = p => configurationManager.UpdateApplicationSettings(this.Bind<ApplicationSettings>());
            
            Get["/configuration"] = p => new
            {
                Printers = printerManager.GetPrinters(),
                Users = userManager.GetUsers(),
                Settings = configurationManager.GetApplicationSettings()
            };

            Get["/users"] = p => userManager.GetUsers();

            Put["/users"] = p =>
            {
                var model = this.Bind<UserAuthentication>();
                return userManager.CreateUser(model.Username, model.Password, model.SessionLifetime);
            };

            Post["/users"] = p =>
            {
                var model = this.Bind<UserAuthentication>();
                return userManager.UpdateUser(model);
            };

            Delete["/users/{id:int}"] = p => this.Ok((Action)(() => userManager.DeleteUser(p.id)));

            Put["/certificate"] = p => this.Ok(() => configurationManager.AddCertificateException(this.Bind<CertificateException>()));            
        }
    }
}