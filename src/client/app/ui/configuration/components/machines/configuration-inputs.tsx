import { BuildRestrictionType, MachineConfiguration, MachineConfigurationCollection, PersistenceModeType } from '@overseer/common/models';
import * as React from 'react';

import { ConfigurationInput } from './configuration-input';
import { ConfigurationInputGroup } from './configuration-input-group';

export type ConfigurationInputsProps = {
  mode: PersistenceModeType;
  restriction: BuildRestrictionType;
  configuration: MachineConfigurationCollection;
  updateConfiguration: (configuration: MachineConfigurationCollection) => void;
};

export const ConfigurationInputs: React.FunctionComponent<ConfigurationInputsProps> = (props: ConfigurationInputsProps) => {
  const { mode, configuration, updateConfiguration, restriction } = props;
  if (!configuration) return null;

  function updateSetting(name: string, setting: MachineConfiguration): void {
    updateConfiguration({ ...configuration, [name]: setting });
  }

  return (
    <React.Fragment>
      {Object.keys(configuration).map(key => {
        const configurationItem = configuration[key];

        if (!(configurationItem.mode & mode)) return null;
        if (configurationItem.restriction && configurationItem.restriction !== restriction) return null;

        if (configurationItem.type === 'group') {
          return (
            <ConfigurationInputGroup
              key={key}
              name={key}
              mode={mode}
              restriction={restriction}
              group={configurationItem}
              updateGroup={updateSetting}
            />
          );
        } else {
          return <ConfigurationInput key={key} name={key} setting={configurationItem} updateSetting={updateSetting} />;
        }
      })}
    </React.Fragment>
  );
};
