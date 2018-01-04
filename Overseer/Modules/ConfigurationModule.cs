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
            Get["/"] = p => configurationManager.GetPrinters();

            Get["/{id:int}"] = p => configurationManager.GetPrinter(p.id);

            Put["/", true] = async (p, ct) => await configurationManager.CreatePrinter(this.Bind<Printer>());

            Post["/", true] = async (p, ct) => await configurationManager.UpdatePrinter(this.Bind<Printer>());

            Delete["/{id:int}"] = p => this.Ok((Action) (() => configurationManager.DeletePrinter(p.id)));

            Get["/settings"] = p => configurationManager.GetApplicationSettings();

            Post["/settings", true] = async (p, ct) => await configurationManager.UpdateApplicationSettings(this.Bind<ApplicationSettings>());
        }
    }
}