using Overseer.Server.Models;

namespace Overseer.Server.Settings
{
  public interface IConfigurationManager
  {
    Task<CertificateDetails> AddCertificateExclusion(CertificateDetails certificate);
    ApplicationInfo GetApplicationInfo();
    ApplicationSettings GetApplicationSettings();
    IEnumerable<CertificateDetails> GetExcludedCertificates();
    Task<ApplicationSettings> UpdateApplicationSettings(ApplicationSettings settings);
  }
}
