using System;
using System.Collections.Generic;
using Overseer.Models;

namespace Overseer
{
    public interface IConfigurationManager
    {
        event EventHandler<EventArgs<ApplicationSettings>> ApplicationSettingsUpdated;
        event EventHandler<EventArgs<CertificateDetails>> CertificateExclusionCreated;

        CertificateDetails AddCertificateExclusion(CertificateDetails certificate);
        ApplicationInfo GetApplicationInfo();
        ApplicationSettings GetApplicationSettings();
        IEnumerable<CertificateDetails> GetExcludedCertificates();
        ApplicationSettings UpdateApplicationSettings(ApplicationSettings settings);
    }
}