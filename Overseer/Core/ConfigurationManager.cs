using Overseer.Core.Data;
using Overseer.Core.Models;

namespace Overseer.Core
{
    public class ConfigurationManager
    {
        readonly IDataContext _context;
        readonly IRepository<CertificateException> _certificateExceptions;
        readonly MonitoringService _monitoringService; 

        public ConfigurationManager(IDataContext context, PrinterProviderManager printerProviderManager,
            MonitoringService monitoringService)
        {
            _context = context;
            _certificateExceptions = context.GetRepository<CertificateException>();

            _monitoringService = monitoringService;
        }

        public ApplicationSettings GetApplicationSettings()
        {
            return _context.GetApplicationSettings();
        }

        public ApplicationSettings UpdateApplicationSettings(ApplicationSettings settings)
        {
            _context.UpdateApplicationSettings(settings);
            _monitoringService.Update(settings);

            return settings;
        }
                
        public void AddCertificateException(CertificateException certificateException)
        {
            _certificateExceptions.Create(certificateException);
        } 
    }
}