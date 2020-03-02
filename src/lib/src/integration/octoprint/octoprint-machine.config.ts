import { ContextType, machineConfigurationBuilder, WebcamOrientationOptions } from '../../models/machines';
import { OctoprintMachineProvider } from './octoprint-machine.provider';

machineConfigurationBuilder.set('Octoprint', {
    configuration: new Map([
        ['Name', { type: 'text', contextType: ContextType.add | ContextType.edit, isRequired: true }],
        ['Url', { type: 'url', contextType: ContextType.add | ContextType.edit, isRequired: true }],
        ['Api Key', { type: 'text', contextType: ContextType.add | ContextType.edit, isRequired: true }],
        ['Profiles', { type: 'options', contextType: ContextType.edit }],
        ['Webcam Url', { type: 'url', contextType: ContextType.edit, isRequired: true }],
        [
            'Webcam Orientation',
            {
                type: 'options',
                contextType: ContextType.edit,
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
    provider: OctoprintMachineProvider
});
