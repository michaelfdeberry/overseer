import { Button, Icon, Typography } from '@material-ui/core';
import PersonAdd from '@material-ui/icons/PersonAdd';
import * as React from 'react';
import { Link, useHistory } from 'react-router-dom';

import { useDispatch, useSelector } from '../../../../hooks';
import { createUser } from '../../../../operations/local/users.operations.local';
import { actions } from '../../../../store/actions';
import { CreateUserForm, CreateUserFormState } from './create-user-form';

export const CreateUserPage: React.FunctionComponent = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const users = useSelector(state => state.users);
  const [state, updateState] = React.useState<CreateUserFormState>({});

  function save() {
    const { isValid, ...user } = state;

    if (isValid) {
      createUser(user).subscribe(newUser => {
        dispatch(actions.users.addUser(newUser));
        history.push('/configuration/users')
      });
    }
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
          <Button color="primary" disabled={!state.isValid} onClick={save}>
            Save
          </Button>
        </div>
      </div>
    </form>
  );
};
