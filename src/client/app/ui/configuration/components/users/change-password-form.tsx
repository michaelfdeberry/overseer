import { Button, TextField, Tooltip } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { DisplayUser } from '@overseer/common/models';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { useDispatch } from '../../../../hooks';
import { changePassword } from '../../../../operations/local/users.operations.local';
import { invoke } from '../../../../operations/operation-invoker';
import { isConfirmPasswordValid } from '../../validators/confirm-password.validator';
import { isPasswordValid } from '../../validators/password.validator';
import { PasswordRequirements } from './password-requirements';

type ChangePasswordFormProps = {
  user: DisplayUser;
};

type ChangePasswordFormState = {
  id: string;
  password?: string;
  confirmPassword?: string;
  passwordTouched?: boolean;
  confirmPasswordTouched?: boolean;
};

export const ChangePasswordForm: React.FunctionComponent<ChangePasswordFormProps> = ({ user }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [isPasswordFocused, setIsPasswordFocused] = React.useState(false);
  const [passwordForm, updatePasswordForm] = React.useState<ChangePasswordFormState>({ id: user.id, password: '', confirmPassword: '' });

  const isPasswordFormValid = (): boolean => {
    return isPasswordValid(passwordForm.password) && isConfirmPasswordValid(passwordForm.password, passwordForm.confirmPassword);
  };

  const submitPasswordForm = (event: React.FormEvent): void => {
    event.preventDefault();

    invoke(dispatch, changePassword({ ...user, password: passwordForm.password })).subscribe(() => {
      history.push('/configuration/users');
    });
  };

  return (
    <form className="configuration-form" onSubmit={submitPasswordForm}>
      <div>
        <Typography variant="caption">Change Password</Typography>
        <Tooltip
          arrow
          open={isPasswordFocused}
          disableFocusListener
          placement="bottom-end"
          title={<PasswordRequirements password={passwordForm.password} />}
        >
          <TextField
            fullWidth
            type="password"
            label="Password"
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => {
              updatePasswordForm({ ...passwordForm, passwordTouched: true });
              setIsPasswordFocused(false);
            }}
            error={passwordForm.passwordTouched && !isPasswordValid(passwordForm.password)}
            value={passwordForm.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePasswordForm({ ...passwordForm, password: e.target.value })}
          />
        </Tooltip>
        <TextField
          fullWidth
          type="password"
          label="Confirm Password"
          onBlur={() => updatePasswordForm({ ...passwordForm, confirmPasswordTouched: true })}
          error={passwordForm.confirmPasswordTouched && !isConfirmPasswordValid(passwordForm.password, passwordForm.confirmPassword)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
        />
      </div>
      <div className="configuration-actions">
        <div className="configuration-actions-secondary"></div>
        <div className="configuration-actions-primary">
          <Button type="submit" color="primary" disabled={!isPasswordFormValid()}>
            Change Password
          </Button>
        </div>
      </div>
    </form>
  );
};
