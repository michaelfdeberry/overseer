import { ContextType, MachineConfiguration } from 'overseer_lib';
import * as React from 'react';

import { ConfigurationInput } from './configuration-input';
import { ConfigurationInputGroup } from './configuration-input-group';

export type ConfigurationInputsProps = {
  currentContext: ContextType;
  configuration: Map<string, MachineConfiguration>;
  updateConfiguration: (configuration: Map<string, MachineConfiguration>) => void;
};

export const ConfigurationInputs: React.FunctionComponent<ConfigurationInputsProps> = (props: ConfigurationInputsProps) => {
  const { currentContext, configuration, updateConfiguration } = props;
  if (!configuration) return null;

  function updateSetting(name: string, setting: MachineConfiguration): void {
    updateConfiguration(
      Array.from(configuration.keys()).reduce((result, key) => {
        if (key === name) {
          result.set(key, setting);
        } else {
          result.set(key, configuration.get(key));
        }

        return result;
      }, new Map<string, MachineConfiguration>())
    );
  }

  return (
    <React.Fragment>
      {Array.from(configuration.keys()).map(key => {
        const configurationItem = configuration.get(key);

        if (!(configurationItem.contextType & currentContext)) return null;

        if (configurationItem.type === 'group') {
          return <ConfigurationInputGroup name={key} currentContext={currentContext} group={configurationItem} updateGroup={updateSetting} />;
        } else {
          return <ConfigurationInput name={key} currentContext={currentContext} setting={configurationItem} updateSetting={updateSetting} />;
        }
      })}
    </React.Fragment>
  );
};
