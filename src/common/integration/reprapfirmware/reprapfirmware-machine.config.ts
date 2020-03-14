import { ContextType, MachineConfigurationBuilder, WebcamOrientationOptions } from '../../models/machines';
import { RepRapFirmwareMachineProvider } from './reprapfirmware-machine.provider';

export function repRapFirmwareConfigFactory(): [string, MachineConfigurationBuilder] {
  return [
    'RepRapFirmware',
    {
      configuration: {
        Name: { type: 'text', contextType: ContextType.add | ContextType.edit, isRequired: true },
        Url: { type: 'url', contextType: ContextType.add | ContextType.edit, isRequired: true },
        'Webcam Url': { type: 'url', contextType: ContextType.add | ContextType.edit, isRequired: true },
        'Webcam Orientation': {
          type: 'options',
          contextType: ContextType.add | ContextType.edit,
          options: WebcamOrientationOptions,
        },
        'Advanced Settings': {
          type: 'group',
          contextType: ContextType.add | ContextType.edit,
          settings: {
            'Client Certificate': { type: 'text', contextType: ContextType.add | ContextType.edit },
          },
        },
      },
      provider: RepRapFirmwareMachineProvider,
    },
  ];
}
