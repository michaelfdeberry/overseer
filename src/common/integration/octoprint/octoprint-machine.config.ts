import { BuildRestrictionType, MachineConfigurationBuilder, PersistenceModeType, WebcamOrientationOptions } from '../../models/machines';
import { OctoprintMachineProvider } from './octoprint-machine.provider';

export function octoprintConfigFactory(): [string, MachineConfigurationBuilder] {
  return [
    'Octoprint',
    {
      configuration: {
        Name: { type: 'text', mode: PersistenceModeType.any, isRequired: true },
        Url: { type: 'url', mode: PersistenceModeType.any, isRequired: true },
        'Api Key': { type: 'text', mode: PersistenceModeType.any, isRequired: true },
        Profiles: { type: 'options', mode: PersistenceModeType.edit },
        'Webcam Url': { type: 'url', mode: PersistenceModeType.edit, isRequired: true },
        'Webcam Orientation': {
          type: 'options',
          mode: PersistenceModeType.edit,
          options: WebcamOrientationOptions,
        },
        'Advanced Settings': {
          type: 'group',
          mode: PersistenceModeType.any,
          restriction: BuildRestrictionType.remote,
          settings: { 'Client Certificate': { type: 'text', mode: PersistenceModeType.any } },
        },
      },
      provider: OctoprintMachineProvider,
    },
  ];
}
