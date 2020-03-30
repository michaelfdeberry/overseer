import { Button, Icon, Typography } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import { BuildRestrictionType, PersistenceModeType } from '@overseer/common/models/machines';
import * as React from 'react';
import { Link, useHistory } from 'react-router-dom';

import { useDispatch, useSelector } from '../../../../hooks';
import { createMachine } from '../../../../operations/local/machines.operations.local';
import { invokeOperation } from '../../../../operations/operation-invoker';
import { actions } from '../../../../store/actions';
import { MachineConfigurationForm, MachineConfigurationFormState } from './machine-configuration-form';

export const CreateMachinePage: React.FunctionComponent = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const restriction = useSelector(state => (state.isLocalApp ? BuildRestrictionType.local : BuildRestrictionType.remote));
  const [machineState, updateMachineState] = React.useState<MachineConfigurationFormState>({});

  const save = (): void => {
    invokeOperation(dispatch, createMachine(machineState.machineType, machineState.configuration), 'Machine Created!').subscribe(machine => {
      dispatch(actions.machines.addMachine(machine));
      history.push('/configuration/machines');
    });
  };

  return (
    <form className="configuration-form">
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
          <Button color="primary" disabled={!machineState.isValid} onClick={save}>
            Save
          </Button>
        </div>
      </div>
    </form>
  );
};
