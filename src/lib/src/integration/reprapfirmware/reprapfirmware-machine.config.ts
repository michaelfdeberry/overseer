import { ContextType, machineConfigurationBuilder, WebcamOrientationOptions } from '../../models/machines';
import { RepRapFirmwareMachineProvider } from './reprapfirmware-machine.provider';

machineConfigurationBuilder.set('RepRapFirmware', {
    configuration: new Map([
        ['Name', { type: 'text', contextType: ContextType.add | ContextType.edit, isRequired: true }],
        ['Url', { type: 'url', contextType: ContextType.add | ContextType.edit, isRequired: true }],
        ['Webcam Url', { type: 'url', contextType: ContextType.add | ContextType.edit, isRequired: true }],
        [
            'Webcam Orientation',
            {
                type: 'options',
                contextType: ContextType.add | ContextType.edit,
                options: WebcamOrientationOptions
            }
        ],
        [
            'Advanced',
            {
                type: 'group',
                contextType: ContextType.add | ContextType.edit,
                settings: new Map([['Client Certificate', { type: 'text', contextType: ContextType.add | ContextType.edit }]])
            }
        ]
    ]),
    provider: RepRapFirmwareMachineProvider
});
