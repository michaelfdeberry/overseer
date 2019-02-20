using Overseer.Data;
using Overseer.Models;
using System;
using System.Collections.Generic;

namespace Overseer
{
    public class ConfigurationManager : IConfigurationManager
    {
        public event EventHandler<EventArgs<ApplicationSettings>> ApplicationSettingsUpdated;
        public event EventHandler<EventArgs<CertificateDetails>> CertificateExclusionCreated;

        readonly IValueStore _valueStore;
        readonly IRepository<CertificateDetails> _certificateExclusions;

        public ConfigurationManager(IDataContext context)
        {
            _valueStore = context.GetValueStore();
            _certificateExclusions = context.GetRepository<CertificateDetails>();            
        }

        public ApplicationSettings GetApplicationSettings()
        {
            return _valueStore.GetOrPut(() => new ApplicationSettings());
        }

        public ApplicationSettings UpdateApplicationSettings(ApplicationSettings settings)
        {
            _valueStore.Put(settings);
            ApplicationSettingsUpdated?.Invoke(this, new EventArgs<ApplicationSettings>(settings));

            return GetApplicationSettings();
        }
                
        public CertificateDetails AddCertificateExclusion(CertificateDetails certificate)
        {
            _certificateExclusions.Create(certificate);
            CertificateExclusionCreated?.Invoke(this, new EventArgs<CertificateDetails>(certificate));

            return certificate;
        }

        public IEnumerable<CertificateDetails> GetExcludedCertificates()
        {
            return _certificateExclusions.GetAll();
        }

        public ApplicationInfo GetApplicationInfo()
        {
            return ApplicationInfo.Instance;
        }
    }
}