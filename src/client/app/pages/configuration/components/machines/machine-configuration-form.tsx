import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { ContextType, MachineConfiguration, machineConfigurationBuilder, MachineSetting, MachineSettingGroup } from '@overseer/common/models';
import * as React from 'react';

import { MachineConfigurationFormState } from '../../store/form-states/machine-configuration-form.state';
import { isRequired } from '../../validators/required.validator';
import { ConfigurationInputs } from './configuration-inputs';

export type MachineConfigurationFormProps = {
  currentContext: ContextType;
  state: MachineConfigurationFormState;
  updateState: (state: MachineConfigurationFormState) => void;
};

export const MachineConfigurationForm: React.FunctionComponent<MachineConfigurationFormProps> = (props: MachineConfigurationFormProps) => {
  const { currentContext, state, updateState } = props;
  const machineTypes = Array.from(machineConfigurationBuilder.keys());

  if ((!state || !state.configuration) && state.type) {
    const currentBuilder = machineConfigurationBuilder.get(state.type);
    updateState({ ...state, configuration: currentBuilder.configuration });
  }

  function setMachineType(event: React.ChangeEvent<HTMLInputElement>): void {
    updateState({ ...state, type: event.target.value });
  }

  function updateConfiguration(configuration: Map<string, MachineConfiguration>): void {
    updateState({ ...state, configuration });
  }

  function validateSetting(setting: MachineSetting): boolean {
    return !setting.isRequired || isRequired(setting.value);
  }

  function validate(): boolean {
    if (!state.configuration) return false;

    for (let key in state.configuration.keys()) {
      const config = state.configuration.get(key);
      if (!(config.contextType & currentContext)) continue;

      if (config.type === 'group') {
        const group = config as MachineSettingGroup;
        if (!Array.from(group.settings.keys()).every(settingKey => validateSetting(group.settings.get(settingKey)))) {
          return false;
        }
      } else {
        const setting = config as MachineSetting;
        if (!validateSetting(setting)) {
          return false;
        }
      }
    }

    return true;
  }

  React.useEffect(() => updateState({ ...state, isValid: validate() }), [validate()]);

  return (
    <React.Fragment>
      <FormControl fullWidth>
        <InputLabel id="machine-type">Machine Type</InputLabel>
        <Select
          fullWidth
          required
          value={state.type}
          onChange={setMachineType}
          inputProps={{
            name: 'accessLevel',
            id: 'access-level',
          }}
        >
          {machineTypes.map((type: string, index: number) => (
            <MenuItem key={`machine_type_${index}`} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <ConfigurationInputs currentContext={currentContext} configuration={state.configuration} updateConfiguration={updateConfiguration} />
    </React.Fragment>
  );
};
