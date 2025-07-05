using Overseer.Server.Channels;
using Overseer.Server.Data;
using Overseer.Server.Models;

namespace Overseer.Server.Settings
{
  public class ConfigurationManager(
    IDataContext context,
    IRestartMonitoringChannel restartMonitoringChannel,
    ICertificateExceptionChannel certificateExceptionChannel
  ) : IConfigurationManager
  {
    readonly IValueStore _valueStore = context.GetValueStore();
    readonly IRepository<CertificateDetails> _certificateExclusions = context.GetRepository<CertificateDetails>();

    public ApplicationSettings GetApplicationSettings()
    {
      return _valueStore.GetOrPut(() => new ApplicationSettings());
    }

    public async Task<ApplicationSettings> UpdateApplicationSettings(ApplicationSettings settings)
    {
      _valueStore.Put(settings);
      await restartMonitoringChannel.Dispatch();

      return GetApplicationSettings();
    }

    public async Task<CertificateDetails> AddCertificateExclusion(CertificateDetails certificate)
    {
      _certificateExclusions.Create(certificate);
      await certificateExceptionChannel.WriteAsync(certificate);

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
