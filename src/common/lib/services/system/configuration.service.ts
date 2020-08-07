import { DataContext } from '../../data/data-context.interface';
import { LogEntry } from '../../models/system';
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

  async writeToLog(logEntry: LogEntry): Promise<void> {
    const count = await this.context.logs.count();
    if (count >= 200) {
      const logEntries = await this.context.logs.getAll();
      const deleted = logEntries
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(199)
        .map(l => l.id);
      await this.context.logs.deleteAll(deleted);
    }

    await this.context.logs.add(logEntry);
  }

  readFromLog(): Promise<LogEntry[]> {
    return this.context.logs.getAll();
  }
}
