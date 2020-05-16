import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';
import Add from '@material-ui/icons/Add';
import { BuildRestrictionType, PersistenceModeType } from '@overseer/common/models/machines';
import * as React from 'react';
import { Link, useHistory } from 'react-router-dom';

import { useDispatch, useSelector } from '../../../hooks';
import { createMachine } from '../../../operations/local/machines.operations.local';
import { invoke } from '../../../operations/operation-invoker';
import { actions } from '../../../store/actions';
import { MachineConfigurationForm, MachineConfigurationFormState } from './machine-configuration-form';

export const CreateMachinePage: React.FunctionComponent = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const restriction = useSelector((state) => (state.isLocalApp ? BuildRestrictionType.local : BuildRestrictionType.remote));
  const [machineState, updateMachineState] = React.useState<MachineConfigurationFormState>({});

  const save = (event: React.FormEvent): void => {
    event.preventDefault();

    invoke(dispatch, createMachine(machineState.machineType, machineState.configuration), 'Machine Created!').subscribe((machine) => {
      dispatch(actions.machines.addMachine(machine));
      history.push('/configuration/machines');
    });
  };

  return (
    <form className="configuration-form" onSubmit={save}>
      <Typography variant="h6">
        <Icon>
          <Add />
        </Icon>
        Add Machine
      </Typography>
      <MachineConfigurationForm mode={PersistenceModeType.add} restriction={restriction} state={machineState} updateState={updateMachineState} />
      <div className="configuration-actions">
        <div className="configuration-actions-secondary"></div>
        <div className="configuration-actions-primary">
          <Button component={Link} to="/configuration/machines">
            Cancel
          </Button>
          <Button type="submit" color="primary" disabled={!machineState.isValid}>
            Save
          </Button>
        </div>
      </div>
    </form>
  );
};
