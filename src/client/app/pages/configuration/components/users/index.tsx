import { Button, Icon } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CheckIcon from '@material-ui/icons/Check';
import EditIcon from '@material-ui/icons/Edit';
import { AccessLevel } from '@overseer/common/models';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { coreActions } from '../../../../core/store/actions';
import { selectUsers } from '../../../../core/store/selectors';
import { sessionLifetimes } from '../../utils/display-options.class';

export const UsersContainer: React.FunctionComponent = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);

  React.useEffect(() => {
    if (!users) {
      dispatch(coreActions.fetchUsers());
    }
  }, [users]);

  if (!users) {
    // TODO: add loader?
    return null;
  }

  function getSessionLifetime(sessionLifetime: number) {
    const item = sessionLifetimes.find(x => x.value === sessionLifetime);
    return item.text;
  }

  return (
    <table className="config-table users">
      <thead>
        <tr>
          <th>Username</th>
          <th>Access Level</th>
          <th>Session Duration</th>
          <th className="centered hidden-mobile">Logged In?</th>
          <th className="action">
            <Button component={Link} to="/configuration/users/add">
              <Icon>
                <AddIcon />
              </Icon>
              Add
            </Button>
          </th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.username}>
            <td>{user.username}</td>
            <td>{AccessLevel[user.accessLevel]}</td>
            <td>{getSessionLifetime(user.sessionLifetime || 0)}</td>
            <td className="centered hidden-mobile">
              {user.isLoggedIn ? (
                <Icon>
                  <CheckIcon />
                </Icon>
              ) : null}
            </td>
            <td className="action">
              <Button component={Link} to={`/configuration/users/edit/${user.id}`}>
                <Icon>
                  <EditIcon />
                </Icon>
                Edit
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
