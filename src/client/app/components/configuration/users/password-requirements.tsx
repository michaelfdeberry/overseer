import { Icon, Typography } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import * as React from 'react';

import { containsLowercase, containsNumber, containsSpecialChar, containsUppercase, isValidLength } from '../validators/password.validator';

export const PasswordRequirements: React.FunctionComponent<{ password: string }> = props => {
  const getClassName = (func: (p: string) => boolean): string => {
    return func(props.password) ? 'success' : 'error';
  };

  return (
    <div className="password-requirements">
      <Typography color="inherit">Password Requirements</Typography>
      <div className={getClassName(isValidLength)}>
        <Icon className="close">
          <CloseIcon />
        </Icon>
        <Icon className="check">
          <CheckIcon />
        </Icon>
        At least 8 characters in length
      </div>
      <div className={getClassName(containsUppercase)}>
        <Icon className="close">
          <CloseIcon />
        </Icon>
        <Icon className="check">
          <CheckIcon />
        </Icon>
        At least one uppercase letter
      </div>
      <div className={getClassName(containsLowercase)}>
        <Icon className="close">
          <CloseIcon />
        </Icon>
        <Icon className="check">
          <CheckIcon />
        </Icon>
        At least one lowercase letter
      </div>
      <div className={getClassName(containsSpecialChar)}>
        <Icon className="close">
          <CloseIcon />
        </Icon>
        <Icon className="check">
          <CheckIcon />
        </Icon>
        At least one special character
      </div>
      <div className={getClassName(containsNumber)}>
        <Icon className="close">
          <CloseIcon />
        </Icon>
        <Icon className="check">
          <CheckIcon />
        </Icon>
        At least one number
      </div>
    </div>
  );
};
