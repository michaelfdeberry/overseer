using System;
using System.Linq;

using Overseer.Data;
using Overseer.Machines.Octoprint;
using Overseer.Machines.RepRapFirmware;
using Overseer.Models;

namespace Overseer.Updates
{
    public class Patch12182018 : IPatch
    {
        public Version Version { get; } = new Version(1, 0, 0, 0);

        public void Execute(LiteDataContext context)
        {
            var db = context.Database;

            //libsodium-net was dropped in favor of bcrypt.net because bcrypt is implemented with 
            //managed code. This was primarily done to simplify the initial installation. However, 
            //this means that any passwords that have been generated are no longer compatible.
            if (db.CollectionExists(nameof(User)))
            {
                db.DropCollection(nameof(User));
            }

            //rename the certificate exception collection, the certificate exception was just 
            //a wrapper for the certificate detail, it was initially created in case there was additional 
            //info that needed to be save that was best not sent to the client. There was not any additional data
            //so it was removed.
            if (db.CollectionExists("CertificateException"))
            {
                db.RenameCollection("CertificateException", nameof(CertificateDetails));
            }

            //The application settings are now stored in the values store
            //There was also some property renames and the RequiresAuthentication property was removed
            //since anonymous access is no longer supported.
            if (db.CollectionExists("ApplicationSettings"))
            {
                var settings = db.GetCollection(nameof(ApplicationSettings)).FindById(1);
                if (settings != null)
                {
                    var newSettings = new ApplicationSettings
                    {
                        HideDisabledMachines = settings["HideDisabledPrinters"].AsBoolean,
                        HideIdleMachines = settings["HideIdlePrinters"].AsBoolean,
                        Interval = settings["Interval"].AsInt32 > 0 ?
                            settings["Interval"].AsInt32 :
                            ApplicationSettings.DefaultInterval,
                        LocalPort = settings["LocalPort"].AsInt32 > 0 ?
                            settings["LocalPort"].AsInt32 :
                            ApplicationSettings.DefaultPort,
                    };

                    context.GetValueStore().Put(newSettings);
                    db.DropCollection(nameof(ApplicationSettings));
                }
            }

            //check if there is a printer collection
            if (db.CollectionExists("Printer"))
            {
                var printerCollection = db.GetCollection("Printer");
                var machineRepository = context.GetRepository<Machine>();
                var printers = printerCollection.FindAll().ToList();

                foreach (var printer in printers)
                {
                    //this will only pull the data required to load the configuration from the machine                            
                    var printerType = printer["PrinterType"].AsString;
                    var config = printer["Config"].AsDocument;

                    switch (printerType)
                    {
                        case "Octoprint":
                            var oMachine = new OctoprintMachine
                            {
                                Id = printer["Id"].AsInt32,
                                Name = printer["Name"].AsString,
                                Disabled = printer["Disabled"].AsBoolean,
                                ApiKey = config["ApiKey"].AsString,
                                Url = config["Url"].AsString,
                                WebCamUrl = config["WebCamUrl"].AsString,
                                ClientCertificate = config["ClientCertificate"].AsString
                            };

                            var oProvider = new OctoprintMachineProvider(oMachine);
                            oProvider.LoadConfiguration(oMachine).Wait();
                            machineRepository.Create(oMachine);
                            break;
                        case "RepRap":
                            var rMachine = new RepRapFirmwareMachine
                            {
                                Id = printer["Id"].AsInt32,
                                Name = printer["Name"].AsString,
                                Disabled = printer["Disabled"].AsBoolean,
                                Url = config["Url"].AsString,
                                WebCamUrl = config["WebCamUrl"].AsString,
                                ClientCertificate = config["ClientCertificate"].AsString
                            };

                            var rProvider = new RepRapFirmwareMachineProvider(rMachine);
                            rProvider.LoadConfiguration(rMachine).Wait();
                            machineRepository.Create(rMachine);
                            break;
                    }
                }

                db.DropCollection("Printer");
            }
        }
    }
}
