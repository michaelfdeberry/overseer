import { Button, Step, StepLabel, Stepper, Typography } from '@material-ui/core';
import { AccessLevel, BuildRestrictionType, PersistenceModeType } from '@overseer/common/models';
import * as React from 'react';
import { Link, useHistory } from 'react-router-dom';

import { useDispatch, useSelector } from '../../../../hooks';
import { createMachine } from '../../../../operations/local/machines.operations.local';
import { createUser } from '../../../../operations/local/users.operations.local';
import { actions } from '../../../../store/actions';
import { catchLogNotify } from '../../../../store/operators';
import { MachineConfigurationForm, MachineConfigurationFormState } from '../machines/machine-configuration-form';
import { ThemeSelector } from '../system/theme-selector';
import { CreateUserForm, CreateUserFormState } from '../users/create-user-form';

export const SetupPage: React.FunctionComponent = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const isSetup = useSelector(state => state.isSetup);
  const restriction = useSelector(state => state.isLocalApp ? BuildRestrictionType.local : BuildRestrictionType.remote);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [userState, updateUserState] = React.useState<CreateUserFormState>({ accessLevel: AccessLevel.Administrator });
  const [machineState, updateMachineState] = React.useState<MachineConfigurationFormState>({});

  if (isSetup) {
    history.replace('/');
    return null;
  }

  function saveAdmin(): void {
    const { isValid, ...user } = userState;
    if (currentStep === 0 && isValid) {
      createUser(user).pipe(catchLogNotify(dispatch)).subscribe(activeUser => {
        dispatch(actions.common.setActiveUser(activeUser));
        dispatch(actions.users.addUser(activeUser));
        setCurrentStep(1);
      });
    }
  }

  function saveMachine(): void {
    if (currentStep === 1 && machineState.isValid) {
      createMachine(machineState.machineType, machineState.configuration).pipe(catchLogNotify(dispatch)).subscribe(machine => {
        dispatch(actions.machines.addMachine(machine));
        setCurrentStep(2);
      })
    }
  }

  function saveMachineAndAddMore(): void {
    if (currentStep === 1 && machineState.isValid) {
      createMachine(machineState.machineType, machineState.configuration).pipe(catchLogNotify(dispatch)).subscribe(machine => {
        dispatch(actions.machines.addMachine(machine));
        setCurrentStep(2);
      })
    }
  }

  function completeSelectTheme(): void {
    setCurrentStep(3);
  }

  function renderStep() {
    switch (currentStep) {
      case 0:
        if (!userState) {
          updateUserState({ accessLevel: AccessLevel.Administrator });
          return null;
        }

        return (
          <form className="configuration-form" onSubmit={saveAdmin}>
            <Typography variant="caption">Please create an administrator account...</Typography>
            <CreateUserForm disableAccessLevel state={userState} updateState={updateUserState} />
            <div className="configuration-actions">
              <div className="configuration-actions-secondary"></div>
              <div className="configuration-actions-primary">
                <Button disabled={!userState.isValid} color="primary" onClick={saveAdmin}>
                  Next
                </Button>
              </div>
            </div>
          </form>
        );
      case 1:
        if (!machineState) {
          updateMachineState({});
          return null;
        }

        return (
          <form className="configuration-form" onSubmit={saveMachine}>
            <Typography variant="caption">Please add at least one machine...</Typography>
            <MachineConfigurationForm
              mode={PersistenceModeType.add}
              restriction={restriction}
              state={machineState}
              updateState={updateMachineState}
            />
            <div className="configuration-actions">
              <div className="configuration-actions-secondary">
                <Button disabled={!machineState.isValid} onClick={saveMachineAndAddMore}>
                  Save &amp; Add More...
                </Button>
              </div>
              <div className="configuration-actions-primary">
                <Button disabled={!machineState.isValid} color="primary" onClick={saveMachine}>
                  Next
                </Button>
              </div>
            </div>
          </form>
        );
      case 2:
        return (
          <form className="configuration-form">
            <Typography variant="caption">Please select your preferred theme...</Typography>
            <ThemeSelector />
            <div className="configuration-actions">
              <div className="configuration-actions-secondary"></div>
              <div className="configuration-actions-primary">
                <Button color="primary" onClick={completeSelectTheme}>
                  Next
                </Button>
              </div>
            </div>
          </form>
        );
      case 3:
        return (
          <form className="configuration-form">
            <Typography variant="caption">The initial setup for Overseer is now complete, what would you like to do next?</Typography>
            <div className="setup-next-steps">
              <Button color="primary" component={Link} to="/">
                Start Monitoring
              </Button>
              <Button color="primary" component={Link} to="/configuration/machines/add">
                Add Machines
              </Button>
              <Button color="primary" component={Link} to="/configuration/users/add">
                Add Users
              </Button>
            </div>
          </form>
        );
      default:
        return null;
    }
  }

  return (
    <React.Fragment>
      <Typography align="center" variant="h6">
        Before you begin let's setup Overseer!
      </Typography>
      <Stepper activeStep={currentStep}>
        <Step>
          <StepLabel>Create Administrator</StepLabel>
        </Step>
        <Step>
          <StepLabel>Add Machine(s)</StepLabel>
        </Step>
        <Step>
          <StepLabel>Select Theme</StepLabel>
        </Step>
        <Step>
          <StepLabel>Done</StepLabel>
        </Step>
      </Stepper>
      {renderStep()}
    </React.Fragment>
  );
};
