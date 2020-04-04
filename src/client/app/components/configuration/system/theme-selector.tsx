import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import * as React from 'react';

import { useDispatch, useSelector } from '../../../hooks';
import { setCurrentTheme } from '../../../operations/theme.operations';
import { actions } from '../../../store/actions';
import { themeOptions } from '../utils/display-options.class';

export const ThemeSelector: React.FunctionComponent = () => {
  const dispatch = useDispatch();
  const currentTheme = useSelector(state => state.currentTheme);

  const onThemeChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setCurrentTheme(event.target.value);
    dispatch(actions.layout.updateTheme(event.target.value));
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="select-theme-label">Theme</InputLabel>
      <Select fullWidth required labelId="access-level-label" value={currentTheme} onChange={onThemeChange}>
        {themeOptions.map((item, index) => (
          <MenuItem key={`theme_${index}`} value={item.value}>
            {item.text}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
