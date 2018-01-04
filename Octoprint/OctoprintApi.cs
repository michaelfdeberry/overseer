using System;
using System.Collections.Generic;
using System.Linq;
using Octoprint.Models;
using Octoprint.Services;

namespace Octoprint
{
    public class OctoprintApi
    {
        readonly Dictionary<Type, OctoprintService> _services;

        public OctoprintApi(string uri, string apiKey)
            : this(new OctoprintOptions {ApiKey = apiKey, Uri = uri})
        {
        }

        public OctoprintApi(OctoprintOptions options)
        {
            _services = GetType()
                .Assembly
                .GetTypes()
                .Where(type => typeof(OctoprintService).IsAssignableFrom(type) && type.IsClass && !type.IsAbstract)
                .ToDictionary(type => type, type => (OctoprintService) Activator.CreateInstance(type, options));
        }

        public VersionInformationService VersionInformation => GetService<VersionInformationService>();

        public ConnectionHandlingService ConnectionHandling => GetService<ConnectionHandlingService>();

        public FileOperationsService FileOperations => GetService<FileOperationsService>();

        public JobOperationsService JobOperations => GetService<JobOperationsService>();

        public LanguagesService Languages => GetService<LanguagesService>();

        public LogFileManagementService LogFileManagement => GetService<LogFileManagementService>();

        public PrinterOperationsService PrinterOperations => GetService<PrinterOperationsService>();

        public PrinterProfileOperationsService PrinterProfileOperations => GetService<PrinterProfileOperationsService>();

        public SettingsService Settings => GetService<SettingsService>();

        public SystemService System => GetService<SystemService>();

        TService GetService<TService>() where TService : OctoprintService
        {
            return (TService) _services[typeof(TService)];
        }
    }
}