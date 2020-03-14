import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { layoutActions } from '../../../../layout/store/actions';
import { AppState } from '../../../../store';
import { themeOptions } from '../../utils/display-options.class';

export const ThemeSelector: React.FunctionComponent = () => {
  const dispatch = useDispatch();
  const currentTheme = useSelector<AppState>(state => state.layout.currentTheme);

  function onThemeChange(event: React.ChangeEvent<HTMLInputElement>) {
    dispatch(layoutActions.updateTheme(event.target.value));
  }

  return (
    <FormControl>
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
