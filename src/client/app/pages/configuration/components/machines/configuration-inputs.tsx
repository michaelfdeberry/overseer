import { ContextType, MachineConfiguration, MachineConfigurationCollection } from '@overseer/common/models';
import * as React from 'react';

import { ConfigurationInput } from './configuration-input';
import { ConfigurationInputGroup } from './configuration-input-group';

export type ConfigurationInputsProps = {
  currentContext: ContextType;
  configuration: MachineConfigurationCollection;
  updateConfiguration: (configuration: MachineConfigurationCollection) => void;
};

export const ConfigurationInputs: React.FunctionComponent<ConfigurationInputsProps> = (props: ConfigurationInputsProps) => {
  const { currentContext, configuration, updateConfiguration } = props;
  if (!configuration) return null;

  function updateSetting(name: string, setting: MachineConfiguration): void {
    updateConfiguration({ ...configuration, [name]: setting });
  }

  return (
    <React.Fragment>
      {Object.keys(configuration).map(key => {
        const configurationItem = configuration[key];

        if (!(configurationItem.contextType & currentContext)) return null;

        if (configurationItem.type === 'group') {
          return (
            <ConfigurationInputGroup key={key} name={key} currentContext={currentContext} group={configurationItem} updateGroup={updateSetting} />
          );
        } else {
          return (
            <ConfigurationInput key={key} name={key} currentContext={currentContext} setting={configurationItem} updateSetting={updateSetting} />
          );
        }
      })}
    </React.Fragment>
  );
};
