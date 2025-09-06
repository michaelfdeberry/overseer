import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApplicationInfo } from '../models/application-info.model';
import { CertificateDetails } from '../models/certificate-details.model';
import { ApplicationSettings } from '../models/settings.model';
import { endpointFactory } from './endpoint-factory';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private getSettingsEndpoint = endpointFactory('/api/settings');
  private getLoggingEndpoint = endpointFactory('/api/logging');
  private http = inject(HttpClient);

  getSettings(): Observable<ApplicationSettings> {
    return this.http.get<ApplicationSettings>(this.getSettingsEndpoint());
  }

  updateSettings(settings: ApplicationSettings): Observable<ApplicationSettings> {
    return this.http.put<ApplicationSettings>(this.getSettingsEndpoint(), settings);
  }

  addCertificateException(certificateDetails: CertificateDetails): Observable<CertificateDetails> {
    return this.http.post(this.getSettingsEndpoint('certificate'), certificateDetails);
  }

  getApplicationInfo(): Observable<ApplicationInfo> {
    return this.http.get<ApplicationInfo>(this.getSettingsEndpoint('about'));
  }

  getLog(): Observable<string> {
    // I am sure not what, but sometimes the log contains text that will break observable
    // if the content of the file is returned directly. Putting it in an object and then
    // piping in a map to get the string seems to work fine.
    return this.http.get<{ content: string }>(this.getLoggingEndpoint()).pipe(map((x) => x.content));
  }
}
