import { Button, Card, CardContent, Container, TextField, Typography } from '@material-ui/core';
import { DisplayUser } from '@overseer/common/models';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { useDispatch, useSelector } from '../../hooks';
import { login } from '../../operations/local/authentication.operations.local';
import { invoke } from '../../operations/operation-invoker';
import { actions } from '../../store/actions';
import { isRequiredFieldValid } from '../configuration/validators/required.validator';

export const LoginPage: React.FunctionComponent = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const activeUser = useSelector(state => state.activeUser);
  const [loginFormState, setLoginFormState] = React.useState<DisplayUser>({});
  const [touched, setTouched] = React.useState({ username: false, password: false });

  const isValid = (): boolean => {
    return isRequiredFieldValid(loginFormState.username) && isRequiredFieldValid(loginFormState.password);
  };

  const signIn = React.useCallback(() => {
    if (!isValid()) return;

    invoke(dispatch, login(loginFormState)).subscribe(user => {
      dispatch(actions.common.setActiveUser(user));
      history.push('/');
    });
  }, []);

  React.useEffect(() => {
    if (activeUser) {
      history.replace('/');
    }
  }, [activeUser]);

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
