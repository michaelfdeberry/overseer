import { Button, Icon, Typography } from '@material-ui/core';
import PersonAdd from '@material-ui/icons/PersonAdd';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';

import { AppState } from '../../../../store';
import { configurationActions } from '../../store/actions';
import { CreateUserFormState } from '../../types/create-user-form.state';
import { CreateUserForm } from './create-user-form';

export const CreateUserContainer: React.FunctionComponent = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const loaded = useSelector<AppState, boolean>(state => state.configuration.users.loaded);
  const complete = useSelector<AppState, boolean>(state => state.configuration.users.complete);
  const state = useSelector<AppState, CreateUserFormState>(state => state.configuration.users.createState);
  const updateState = (s: CreateUserFormState) => dispatch(configurationActions.users.updateCreateState(s));

  React.useEffect(() => {
    if (!loaded) {
      dispatch(configurationActions.users.load());
    }
  }, [loaded]);

  React.useEffect(() => {
    if (!state) {
      updateState({});
    }
  }, [!!state]);

  if (!loaded) {
    return null;
  }

  if (complete) {
    history.push('/configuration/users');
    return null;
  }

  return (
    <form className="configuration-form">
      <Typography variant="h6">
        <Icon>
          <PersonAdd />
        </Icon>
        Add User
      </Typography>
      <CreateUserForm state={state} updateState={updateState} />
      <div className="configuration-actions">
        <div className="configuration-actions-secondary"></div>
        <div className="configuration-actions-primary">
          <Button onClick={() => updateState(undefined)} component={Link} to="/configuration/users">
            Cancel
          </Button>
          <Button disabled={!state.isValid} onClick={() => dispatch(configurationActions.users.create())}>
            Save
          </Button>
        </div>
      </div>
    </form>
  );
};
