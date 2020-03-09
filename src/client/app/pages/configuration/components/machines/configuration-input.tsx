import { FormControl, InputLabel, MenuItem, Select, TextField } from '@material-ui/core';
import { ContextType, MachineSetting } from 'overseer_lib';
import * as React from 'react';

import { isRequired } from '../../validators/required.validator';

export type ConfigurationInputProps = {
  currentContext: ContextType;
  name: string;
  setting: MachineSetting;
  updateSetting: (name: string, setting: MachineSetting) => void;
};

export const ConfigurationInput: React.FunctionComponent<ConfigurationInputProps> = (props: ConfigurationInputProps) => {
  const { currentContext, name, setting, updateSetting } = props;
  if (!(setting.contextType & currentContext)) return null;

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    updateSetting(name, { ...setting, value: event.target.value });
  }

  switch (setting.type) {
    case 'options':
      return (
        <FormControl>
          <InputLabel>{name}</InputLabel>
          <Select
            fullWidth
            required={setting.isRequired}
            value={setting.value}
            onChange={handleChange}
            error={setting.isRequired && isRequired(setting.value)}
          >
            {setting.options.map((option: { key: string; value: string }, index: number) => {
              return (
                <MenuItem key={`${name}_${index}`} value={option.value}>
                  {option.key}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      );
    case 'number':
    case 'text':
    case 'url':
    default:
      return (
        <TextField
          fullWidth
          required={setting.isRequired}
          value={setting.value}
          onChange={handleChange}
          type={setting.type}
          error={setting.isRequired && isRequired(setting.value)}
        />
      );
  }
};
