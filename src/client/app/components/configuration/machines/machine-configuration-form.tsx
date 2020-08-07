import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import {
  BuildRestrictionType,
  MachineConfigurationCollection,
  MachineSetting,
  MachineSettingGroup,
  PersistenceModeType
} from '@overseer/common/lib/models';
import * as React from 'react';

import { useDispatch } from '../../../hooks';
import { getMachineConfig, getMachineTypes } from '../../../operations/local/machines.operations.local';
import { invoke } from '../../../operations/operation-invoker';
import { DisplayOption } from '../../../utils/display-options.class';
import { isRequiredFieldValid } from '../validators/required.validator';
import { ConfigurationInputs } from './configuration-inputs';

export type MachineConfigurationFormProps = {
  mode: PersistenceModeType;
  restriction: BuildRestrictionType;
  state: MachineConfigurationFormState;
  updateState: (state: MachineConfigurationFormState) => void;
};

export interface MachineConfigurationFormState {
  isValid?: boolean;
  machineType?: string;
  configuration?: MachineConfigurationCollection;
}

export const MachineConfigurationForm: React.FunctionComponent<MachineConfigurationFormProps> = (props: MachineConfigurationFormProps) => {
  const { mode, state, updateState, restriction = BuildRestrictionType.none } = props;
  const dispatch = useDispatch();
  const [machineTypes, setMachineTypes] = React.useState<DisplayOption<string>[]>();

  const setMachineType = (event: React.ChangeEvent<HTMLInputElement>): void => {
    updateState({ ...state, machineType: event.target.value });
  };

  const updateConfiguration = (configuration: MachineConfigurationCollection): void => {
    updateState({ ...state, configuration });
  };

  const validateSetting = (setting: MachineSetting): boolean => {
    return !setting.isRequired || isRequiredFieldValid(setting.value);
  };

  const validate = (): boolean => {
    if (!state.configuration) return false;

    for (const config of Object.values(state.configuration)) {
      if (!(config.mode & mode)) continue;
      if (config.restriction && config.restriction !== restriction) continue;

      if (config.type === 'group') {
        const group = config as MachineSettingGroup;
        if (!Object.values(group.settings).every((setting) => validateSetting(setting))) {
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
  };

  React.useEffect(() => {
    invoke(dispatch, getMachineTypes()).subscribe((machineTypes) => {
      setMachineTypes(machineTypes.map((key) => new DisplayOption(key, key)));
    });
  }, []);

  React.useEffect(() => {
    invoke(dispatch, getMachineConfig(state.machineType)).subscribe((configuration) => {
      updateConfiguration(configuration);
    });
  }, [state.machineType]);

  React.useEffect(() => {
    updateState({ ...state, isValid: validate() });
  }, [validate()]);

  return (
    <React.Fragment>
      {props.mode === PersistenceModeType.add ? (
        <FormControl fullWidth>
          <InputLabel id="machine-type">Machine Type</InputLabel>
          <Select
            fullWidth
            required
            value={state.machineType || ''}
            onChange={setMachineType}
            inputProps={{
              name: 'accessLevel',
              id: 'access-level'
            }}
          >
            <MenuItem value={''}>Select Machine...</MenuItem>
            {machineTypes.map((type: DisplayOption<string>, index: number) => (
              <MenuItem key={`machine_type_${index}`} value={type.value}>
                {type.text}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : null}
      <ConfigurationInputs mode={mode} restriction={restriction} configuration={state.configuration} updateConfiguration={updateConfiguration} />
    </React.Fragment>
  );
};
