import { DataContext } from '../../data/data-context.interface';
import { Certificate } from '../../models/system/certificate.class';
import { defaultSystemSettings, SystemSettings } from '../../models/system/settings.interface';

export class SystemConfigurationService {
  constructor(private context: DataContext) {}

  getSystemSetting(): Promise<SystemSettings> {
    return this.context.values.getOrSet<SystemSettings>('SystemSettings', () => defaultSystemSettings);
  }

  updateSystemSettings(settings: SystemSettings): Promise<void> {
    return this.context.values.set('SystemSettings', settings);
  }

  addCertificateExclusion(certificate: Certificate): Promise<string> {
    return this.context.certificates.add(certificate);
  }

  getExcludedCertificates(): Promise<Certificate[]> {
    return this.context.certificates.getAll();
  }

  getSystemInfo(): Promise<{ [key: string]: string }> {
    return Promise.resolve({ version: '2.0.0.0-alpha', todo: 'Refactor this' });
  }
}
