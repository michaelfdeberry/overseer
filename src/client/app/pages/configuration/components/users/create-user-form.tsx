import { FormControl, InputLabel, MenuItem, Select, TextField } from '@material-ui/core';
import * as React from 'react';

import { CreateUserFormState } from '../../store/form-states/create-user-form.state';
import { accessLevels, sessionLifetimes } from '../../utils/display-options.class';
import { isConfirmPasswordValid } from '../../validators/confirm-password.validator';
import { isPasswordValid } from '../../validators/password.validator';
import { isRequired } from '../../validators/required.validator';
import { isUsernameValid } from '../../validators/username.validator';

export type CreateUserFormProps = {
  disableAccessLevel: boolean;
  state: CreateUserFormState;
  updateState: (user: CreateUserFormState) => void;
};

export const CreateUserForm: React.FunctionComponent<CreateUserFormProps> = (props: CreateUserFormProps) => {
  const { disableAccessLevel, state, updateState } = props;

  function validate(): boolean {
    const excludeUndefined = false;
    return (
      isRequired(state.accessLevel) &&
      isUsernameValid(state.username, excludeUndefined) &&
      isPasswordValid(state.password, excludeUndefined) &&
      isConfirmPasswordValid(state.password, state.confirmPassword, excludeUndefined)
    );
  }

  function handleChange(name: keyof CreateUserFormState): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event: React.ChangeEvent<HTMLInputElement>): void => {
      updateState({ ...state, [name]: event.target.value });
    };
  }

  React.useEffect(() => updateState({ ...state, isValid: validate() }), [validate()]);

  return (
    <React.Fragment>
      <FormControl>
        <InputLabel id="access-level-label">Access Level</InputLabel>
        <Select
          fullWidth
          required
          labelId="access-level-label"
          disabled={disableAccessLevel}
          value={state.accessLevel}
          onChange={handleChange('accessLevel')}
          error={!isRequired(state.accessLevel)}
        >
          {accessLevels.map((item, index) => (
            <MenuItem key={`access_level_${index}`} value={item.value}>
              {item.text}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        fullWidth
        required
        id="username"
        label="Username"
        value={state.username || ''}
        onChange={handleChange('username')}
        type="text"
        error={!isUsernameValid(state.username)}
      />
      <TextField
        fullWidth
        required
        id="password"
        label="Password"
        value={state.password || ''}
        onChange={handleChange('password')}
        type="password"
        error={!isPasswordValid(state.password)}
      />
      <TextField
        fullWidth
        required
        id="confirm-password"
        label="Confirm Password"
        value={state.confirmPassword || ''}
        onChange={handleChange('confirmPassword')}
        type="password"
        error={!isConfirmPasswordValid(state.password, state.confirmPassword)}
      />
      <FormControl>
        <InputLabel id="session-lifetime-label">Session Lifetime</InputLabel>
        <Select fullWidth labelId="session-lifetime-label" value={state.sessionLifetime || 0} onChange={handleChange('sessionLifetime')}>
          {sessionLifetimes.map((item, index) => (
            <MenuItem key={`session_lifetime_${index}`} value={item.value}>
              {item.text}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </React.Fragment>
  );
};
