import { Button, FormControl, Icon, InputLabel, MenuItem, Select, Typography } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import PersonIcon from '@material-ui/icons/Person';
import { DisplayUser } from '@overseer/common/models';
import * as React from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';

import { useDispatch, useSelector } from '../../../hooks';
import { logout, logoutUser } from '../../../operations/local/authentication.operations.local';
import { deleteUser, getUsers, updateUser } from '../../../operations/local/users.operations.local';
import { invoke } from '../../../operations/operation-invoker';
import { actions } from '../../../store/actions';
import { accessLevels, sessionLifetimes } from '../../../utils/display-options.class';
import { PromptDialog } from '../../common/prompt-dialog';
import { ChangePasswordForm } from './change-password-form';
import { GenerateSsoInput } from './generate-sso-input';

export const UpdateUserPage: React.FunctionComponent = () => {
  const { id } = useParams();
  const history = useHistory();
  const dispatch = useDispatch();
  const users = useSelector(state => state.users);
  const activeUser = useSelector(state => state.activeUser);
  const [user, setUser] = React.useState<DisplayUser>();
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [unmodifiedUser, setUnmodifiedUser] = React.useState<DisplayUser>();

  const update = (event: React.FormEvent): void => {
    event.preventDefault();

    invoke(dispatch, updateUser(user), `User ${user.username} Updated!`).subscribe(updatedUser => {
      dispatch(actions.users.updateUser(updatedUser));
      history.push('/configuration/users');
    });
  };

  const remove = (): void => {
    invoke(dispatch, deleteUser(user), `User ${user.username} Removed!`).subscribe(deletedUser => {
      dispatch(actions.users.removedUser(deletedUser));
      history.push('/configuration/users');
    });
  };

  const signOut = (): void => {
    if (activeUser.id === user.id) {
      invoke(dispatch, logout(activeUser.token)).subscribe(() => {
        dispatch(actions.common.clearActiveUser());
        history.push('/login');
      });
    } else {
      invoke(dispatch, logoutUser(user.id)).subscribe(updatedUser => {
        setUser(updatedUser);
      });
    }
  };

  React.useEffect(() => {
    if (!users) {
      invoke(dispatch, getUsers()).subscribe(u => dispatch(actions.users.updateUsers(u)));
    }
  }, [users]);

  React.useEffect(() => {
    if (users && !user) {
      const foundUser = users.find(u => u.id === id);
      setUser(foundUser);
      setUnmodifiedUser(foundUser);
    }
  }, [users, id]);

  if (!user) return null;

  return (
    <React.Fragment>
      <form className="configuration-form">
        <Typography variant="h6">
          <Icon className="sub-icon">
            <EditIcon />
          </Icon>
          <Icon>
            <PersonIcon />
          </Icon>
          Editing User
          <em> &apos;{user.username}&apos; </em>
        </Typography>
      </form>
      <ChangePasswordForm user={unmodifiedUser} />
      <form className="configuration-form" onSubmit={update}>
        <Typography variant="caption">Account Settings</Typography>
        <FormControl fullWidth>
          <InputLabel id="access-level-label">Access Level</InputLabel>
          <Select disabled fullWidth required labelId="access-level-label" value={user.accessLevel}>
            {accessLevels.map((item, index) => (
              <MenuItem key={`access_level_${index}`} value={item.value}>
                {item.text}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="session-lifetime-label">Session Lifetime</InputLabel>
          <Select
            fullWidth
            labelId="session-lifetime-label"
            value={user.sessionLifetime || 0}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUser({ ...user, sessionLifetime: parseInt(e.target.value, 10) })}
          >
            {sessionLifetimes.map((item, index) => (
              <MenuItem key={`session_lifetime_${index}`} value={item.value}>
                {item.text}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <GenerateSsoInput user={user} />
        <div className="configuration-actions">
          <div className="configuration-actions-secondary">
            <Button className="danger-button" onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
            <Button disabled={!user.isLoggedIn} onClick={signOut}>
              Sign Out
            </Button>
          </div>
          <div className="configuration-actions-primary">
            <Button component={Link} to="/configuration/users">
              Cancel
            </Button>
            <Button type="submit" color="primary" disabled={user.sessionLifetime === unmodifiedUser.sessionLifetime}>
              Save
            </Button>
          </div>
        </div>
      </form>
      <PromptDialog open={confirmDelete} setOpen={setConfirmDelete} onConfirm={remove} message="Are you sure you want to remove this user?" />
    </React.Fragment>
  );
};
