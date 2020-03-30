import { Button, FormControlLabel, Icon, Switch, Typography } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import { BuildRestrictionType, Machine, PersistenceModeType } from '@overseer/common/models';
import { equals } from 'lodash/fp';
import * as React from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';

import { useDispatch, useSelector } from '../../../../hooks';
import { deleteMachine, getMachines, updateMachine } from '../../../../operations/local/machines.operations.local';
import { invokeOperation } from '../../../../operations/operation-invoker';
import { actions } from '../../../../store/actions';
import { PromptDialog } from '../../../common/prompt-dialog';
import { MachineConfigurationForm, MachineConfigurationFormState } from './machine-configuration-form';

export const UpdateMachinePage: React.FunctionComponent = () => {
  const { id } = useParams();
  const history = useHistory();
  const dispatch = useDispatch();
  const machineRef = React.useRef<Machine>();
  const machines = useSelector(state => state.machines);
  const restriction = useSelector(state => (state.isLocalApp ? BuildRestrictionType.local : BuildRestrictionType.remote));
  const [machine, setMachine] = React.useState<Machine>();
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [machineState, updateMachineState] = React.useState<MachineConfigurationFormState>({});

  const update = (): void => {
    invokeOperation(dispatch, updateMachine(machine), `Machine ${machine.name} Updated!`).subscribe(machine => {
      dispatch(actions.machines.updateMachine(machine));
      history.push('/configuration/machines');
    });
  };

  const remove = (): void => {
    invokeOperation(dispatch, deleteMachine(machine), `Machine ${machine.name} Removed!`).subscribe(() => {
      dispatch(actions.machines.removeMachine(machine));
      history.push('/configuration/machines');
    });
  };

  const onFormStateChange = (state: MachineConfigurationFormState): void => {
    setMachine(Object.assign(new Machine(), machine, { configuration: state.configuration }));
    updateMachineState(state);
  };

  const toggleDisabledState = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setMachine(Object.assign(new Machine(), machine, { disabled: event.target.checked }));
  };

  React.useEffect(() => {
    if (!machines) {
      invokeOperation(dispatch, getMachines()).subscribe(machines => {
        dispatch(actions.machines.updateMachines(machines));
      });
    }
  }, [machines]);

  React.useEffect(() => {
    if (!machines) return;

    const foundMachine = machines.find(m => m.id === id);
    if (!foundMachine) return;

    machineRef.current = foundMachine;
    setMachine(foundMachine);
    updateMachineState({ machineType: foundMachine.type, configuration: foundMachine.configuration });
  }, [machines, id]);

  if (!machine) return null;

  return (
    <form className="configuration-form">
      <Typography variant="h6">
        <Icon>
          <Edit />
        </Icon>
        Editing Machine <em> &apos;{machineRef.current.name}&apos; </em>
        <span className="action">
          <FormControlLabel
            label="Disable Monitoring?"
            control={<Switch name="hideIdleMachines" checked={machine.disabled || false} onChange={toggleDisabledState} color="secondary" />}
          />
        </span>
      </Typography>
      <MachineConfigurationForm mode={PersistenceModeType.edit} restriction={restriction} state={machineState} updateState={onFormStateChange} />
      <div className="configuration-actions">
        <div className="configuration-actions-secondary">
          <Button className="danger-button" onClick={() => setConfirmDelete(true)}>
            Delete
          </Button>
        </div>
        <div className="configuration-actions-primary">
          <Button component={Link} to="/configuration/machines">
            Cancel
          </Button>
          <Button color="primary" disabled={equals(machineRef.current, machine)} onClick={update}>
            Save
          </Button>
        </div>
      </div>
      <PromptDialog open={confirmDelete} setOpen={setConfirmDelete} onConfirm={remove} message="Are you sure you want to remove this machine?" />
    </form>
  );
};
