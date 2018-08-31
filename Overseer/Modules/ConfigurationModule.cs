using System;
using Nancy;
using Nancy.ModelBinding;
using Nancy.Security;
using Overseer.Core;
using Overseer.Core.Models;

namespace Overseer.Modules
{
    public class ConfigurationModule : NancyModule
    {
        public ConfigurationModule(ConfigurationManager configurationManager, PrinterManager printerManager, UserManager userManager)
            : base("config")
        {
            this.RequiresMSOwinAuthentication();

            Get["/printers"] = p => printerManager.GetPrinters();

            Get["/printers/{id:int}"] = p => printerManager.GetPrinter(p.id);

            Put["/printers", true] = async (p, ct) => await printerManager.CreatePrinter(this.Bind<Printer>());

            Post["/printers", true] = async (p, ct) => await printerManager.UpdatePrinter(this.Bind<Printer>());

            Delete["/printers/{id:int}"] = p => this.Ok((Action)(() => printerManager.DeletePrinter(p.id)));

            Get["/settings/bundle"] = p => new
            {
                Printers = printerManager.GetPrinters(),
                Users = userManager.GetUsers(),
                Settings = configurationManager.GetApplicationSettings()
            };

            Get["/settings"] = p => configurationManager.GetApplicationSettings();

            Post["/settings"] = p => configurationManager.UpdateApplicationSettings(this.Bind<ApplicationSettings>());
            

            Get["/users"] = p => userManager.GetUsers();

            Get["/users/{id:int}"] = p => userManager.GetUser(p.id);

            Put["/users"] = p =>
            {
                var model = this.Bind<UserAuthentication>();
                return userManager.CreateUser(model.Username, model.Password, model.SessionLifetime);
            };

            Post["/users"] = p => userManager.UpdateUser(this.Bind<UserAuthentication>());

            Delete["/users/{id:int}"] = p => this.Ok((Action)(() => userManager.DeleteUser(p.id)));

            
            Put["/certificate"] = p => this.Ok(() => configurationManager.AddCertificateException(this.Bind<CertificateException>()));

            Get["/about"] = p => AppInfo.Instance;
        }
    }
}