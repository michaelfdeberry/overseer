import { Typography } from '@material-ui/core';
import * as React from 'react';

export const PasswordRequirements: React.FunctionComponent = () => {
  return (
    <React.Fragment>
      <Typography color="inherit">Password Requirements</Typography>
      <div>At least 8 characters in length</div>
      <div>At least one uppercase letter</div>
      <div>At least one lowercase letter</div>
      <div>At least one special character</div>
      <div>At least one number</div>
    </React.Fragment>
  );
};
