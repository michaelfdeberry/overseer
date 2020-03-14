import { ContextType, MachineConfigurationBuilder, WebcamOrientationOptions } from '../../models/machines';
import { OctoprintMachineProvider } from './octoprint-machine.provider';

export function octoprintConfigFactory(): [string, MachineConfigurationBuilder] {
  return [
    'Octoprint',
    {
      configuration: {
        Name: { type: 'text', contextType: ContextType.add | ContextType.edit, isRequired: true },
        Url: { type: 'url', contextType: ContextType.add | ContextType.edit, isRequired: true },
        'Api Key': { type: 'text', contextType: ContextType.add | ContextType.edit, isRequired: true },
        Profiles: { type: 'options', contextType: ContextType.edit },
        'Webcam Url': { type: 'url', contextType: ContextType.edit, isRequired: true },
        'Webcam Orientation': {
          type: 'options',
          contextType: ContextType.edit,
          options: WebcamOrientationOptions,
        },
        'Advanced Settings': {
          type: 'group',
          contextType: ContextType.add | ContextType.edit,
          settings: { 'Client Certificate': { type: 'text', contextType: ContextType.add | ContextType.edit } },
        },
      },
      provider: OctoprintMachineProvider,
    },
  ];
}
