import { FormControl, InputLabel, MenuItem, Select, TextField, Tooltip } from '@material-ui/core';
import { AccessLevel } from '@overseer/common/models';
import * as React from 'react';

import { accessLevels, sessionLifetimes } from '../../utils/display-options.class';
import { isConfirmPasswordValid } from '../../validators/confirm-password.validator';
import { isPasswordValid } from '../../validators/password.validator';
import { isRequiredFieldValid } from '../../validators/required.validator';
import { PasswordRequirements } from './password-requirements';

export type CreateUserFormProps = {
  disableAccessLevel?: boolean;
  state: CreateUserFormState;
  updateState: (user: CreateUserFormState) => void;
};

export interface CreateUserFormState {
  isValid?: boolean;
  username?: string;
  password?: string;
  confirmPassword?: string;
  sessionLifetime?: number;
  accessLevel?: AccessLevel;
}

export const CreateUserForm: React.FunctionComponent<CreateUserFormProps> = (props: CreateUserFormProps) => {
  const { disableAccessLevel, state, updateState } = props;
  const [passwordFocused, setPasswordFocused] = React.useState(false);
  const [touched, setTouched] = React.useState({
    accessLevel: false,
    username: false,
    password: false,
    confirmPassword: false,
  });

  function validate(): boolean {
    return (
      isRequiredFieldValid(state.accessLevel) &&
      isRequiredFieldValid(state.username) &&
      isPasswordValid(state.password) &&
      isConfirmPasswordValid(state.password, state.confirmPassword)
    );
  }

  function handleChange(name: keyof CreateUserFormState): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event: React.ChangeEvent<HTMLInputElement>): void => {
      updateState({ ...state, [name]: event.target.value });
    };
  }

  function handleTouch(name: keyof CreateUserFormState): void {
    setTouched({ ...touched, [name]: true });
  }

  React.useEffect(() => {
    updateState({ ...state, isValid: validate() });
  }, [validate()]);

  return (
    <React.Fragment>
      <FormControl fullWidth>
        <InputLabel id="access-level-label">Access Level</InputLabel>
        <Select
          fullWidth
          required
          labelId="access-level-label"
          disabled={disableAccessLevel}
          value={state.accessLevel || ''}
          onBlur={() => handleTouch('accessLevel')}
          onChange={handleChange('accessLevel')}
          error={touched.accessLevel && !isRequiredFieldValid(state.accessLevel)}
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
        onBlur={() => handleTouch('username')}
        onChange={handleChange('username')}
        type="text"
        error={touched.username && !isRequiredFieldValid(state.username)}
      />
      <Tooltip arrow open={passwordFocused} placement="bottom-end" disableFocusListener title={<PasswordRequirements password={state.password} />}>
        <TextField
          fullWidth
          required
          id="password"
          label="Password"
          value={state.password || ''}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => {
            handleTouch('password');
            setPasswordFocused(false);
          }}
          onChange={handleChange('password')}
          type="password"
          error={touched.password && !isPasswordValid(state.password)}
        />
      </Tooltip>
      <TextField
        fullWidth
        required
        id="confirm-password"
        label="Confirm Password"
        value={state.confirmPassword || ''}
        onBlur={() => handleTouch('confirmPassword')}
        onChange={handleChange('confirmPassword')}
        type="password"
        error={touched.confirmPassword && !isConfirmPasswordValid(state.password, state.confirmPassword)}
      />
      <FormControl fullWidth>
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
