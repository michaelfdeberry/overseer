import { Button, Card, CardContent, Container, TextField, Typography } from '@material-ui/core';
import { DisplayUser } from '@overseer/common/models';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { coreActions } from '../../core/store/actions';
import { selectActiveUser } from '../../core/store/selectors';
import { isRequiredFieldValid } from '../configuration/validators/required.validator';

export const LoginContainer: React.FunctionComponent = () => {
  const activeUser = useSelector(selectActiveUser);
  const [loginFormState, setLoginFormState] = React.useState<DisplayUser>({});
  const [touched, setTouched] = React.useState({ username: false, password: false });
  const dispatch = useDispatch();
  const history = useHistory();

  React.useEffect(() => {
    if (!activeUser) return;
    history.replace('/');
  }, [activeUser]);

  function isValid() {
    return isRequiredFieldValid(loginFormState.username) && isRequiredFieldValid(loginFormState.password);
  }

  function signIn() {
    if (!isValid()) return;
    dispatch(coreActions.signIn(loginFormState));
  }

  return (
    <Container className="configuration" maxWidth="md">
      <Card>
        <CardContent>
          <form className="configuration-form">
            <Typography variant="h6">Please Sign In...</Typography>
            <TextField
              type="text"
              fullWidth
              label="Username"
              onBlur={() => setTouched({ ...touched, username: true })}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginFormState({ ...loginFormState, username: e.target.value })}
              error={touched.username && !isRequiredFieldValid(loginFormState.username)}
            ></TextField>
            <TextField
              type="password"
              fullWidth
              label="Password"
              onBlur={() => setTouched({ ...touched, password: true })}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginFormState({ ...loginFormState, password: e.target.value })}
              error={touched.password && !isRequiredFieldValid(loginFormState.password)}
            ></TextField>
            <div className="configuration-actions">
              <div className="configuration-actions-secondary"></div>
              <div className="configuration-actions-primary">
                <Button disabled={!isValid()} color="primary" onClick={signIn}>
                  Sign In
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};
