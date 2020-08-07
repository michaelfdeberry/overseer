import { BuildRestrictionType, MachineConfigurationBuilder, PersistenceModeType, WebcamOrientationOptions } from '../../models/machines';
import { RepRapFirmwareMachineProvider } from './reprapfirmware-machine.provider';

export function repRapFirmwareConfigFactory(): [string, MachineConfigurationBuilder] {
  return [
    'RepRapFirmware',
    {
      configuration: {
        Name: { type: 'text', mode: PersistenceModeType.any, isRequired: true },
        Url: { type: 'url', mode: PersistenceModeType.any, isRequired: true },
        'Webcam Url': { type: 'url', mode: PersistenceModeType.any, isRequired: true },
        'Webcam Orientation': {
          type: 'options',
          mode: PersistenceModeType.any,
          options: WebcamOrientationOptions
        },
        'Advanced Settings': {
          type: 'group',
          mode: PersistenceModeType.any,
          restriction: BuildRestrictionType.remote,
          settings: {
            'Client Certificate': { type: 'text', mode: PersistenceModeType.any }
          }
        }
      },
      provider: RepRapFirmwareMachineProvider
    }
  ];
}
