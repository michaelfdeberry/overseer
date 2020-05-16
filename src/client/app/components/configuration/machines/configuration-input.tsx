import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { MachineSetting } from '@overseer/common/models';
import * as React from 'react';

import { DisplayOption } from '../../../utils/display-options.class';
import { isRequiredFieldValid } from '../validators/required.validator';

export type ConfigurationInputProps = {
  name: string;
  setting: MachineSetting;
  updateSetting: (name: string, setting: MachineSetting) => void;
};

export const ConfigurationInput: React.FunctionComponent<ConfigurationInputProps> = (props: ConfigurationInputProps) => {
  const [touched, setTouched] = React.useState(false);
  const { name, setting, updateSetting } = props;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    updateSetting(name, { ...setting, value: event.target.value });
  };

  const hasError = (): boolean => {
    return touched && setting.isRequired && !isRequiredFieldValid(setting.value);
  };

  switch (setting.type) {
    case 'options':
      return (
        <FormControl fullWidth>
          <InputLabel>{name}</InputLabel>
          <Select
            fullWidth
            onBlur={() => setTouched(true)}
            required={setting.isRequired}
            value={setting.value || setting.options[0].value}
            onChange={handleChange}
            error={hasError()}
          >
            {setting.options.map((option: DisplayOption<string>, index: number) => {
              return (
                <MenuItem key={`${name}_${index}`} value={option.value}>
                  {option.text}
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
          label={name}
          onBlur={() => setTouched(true)}
          required={setting.isRequired}
          value={setting.value || ''}
          onChange={handleChange}
          type={setting.type}
          error={hasError()}
        />
      );
  }
};
