import { Button, Step, StepLabel, Stepper, Typography } from '@material-ui/core';
import { AccessLevel, BuildRestrictionType, PersistenceModeType } from '@overseer/common/models';
import * as React from 'react';
import { Link, useHistory } from 'react-router-dom';

import { useDispatch, useSelector } from '../../../../hooks';
import { createMachine } from '../../../../operations/local/machines.operations.local';
import { createUser } from '../../../../operations/local/users.operations.local';
import { invoke } from '../../../../operations/operation-invoker';
import { actions } from '../../../../store/actions';
import { MachineConfigurationForm, MachineConfigurationFormState } from '../machines/machine-configuration-form';
import { ThemeSelector } from '../system/theme-selector';
import { CreateUserForm, CreateUserFormState } from '../users/create-user-form';

export const SetupPage: React.FunctionComponent = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const isSetup = useSelector(state => state.isSetup);
  const restriction = useSelector(state => (state.isLocalApp ? BuildRestrictionType.local : BuildRestrictionType.remote));
  const [currentStep, setCurrentStep] = React.useState(0);
  const [userState, updateUserState] = React.useState<CreateUserFormState>({ accessLevel: AccessLevel.Administrator });
  const [machineState, updateMachineState] = React.useState<MachineConfigurationFormState>({});
  const [setupStarted] = React.useState(!isSetup);

  const saveAdmin = (event: React.FormEvent): void => {
    event.preventDefault();

    const { isValid, ...user } = userState;
    if (currentStep === 0 && isValid) {
      invoke(dispatch, createUser(user)).subscribe(activeUser => {
        dispatch(actions.common.setActiveUser(activeUser));
        dispatch(actions.users.updateUsers([activeUser]));
        setCurrentStep(1);
      });
    }
  };

  const saveMachine = (event: React.FormEvent): void => {
    event.preventDefault();

    if (currentStep === 1 && machineState.isValid) {
      invoke(dispatch, createMachine(machineState.machineType, machineState.configuration)).subscribe(machine => {
        dispatch(actions.machines.addMachine(machine));
        setCurrentStep(2);
      });
    }
  };

  const saveMachineAndAddMore = (): void => {
    if (currentStep === 1 && machineState.isValid) {
      invoke(dispatch, createMachine(machineState.machineType, machineState.configuration)).subscribe(machine => {
        dispatch(actions.machines.addMachine(machine));
        setCurrentStep(2);
      });
    }
  };

  const completeSelectTheme = (): void => {
    dispatch(actions.common.initialize({ isInitialized: true, isSetup: true }));
    setCurrentStep(3);
  };

  const renderAdminStep = (): React.ReactNode => {
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
            <Button type="submit" disabled={!userState.isValid} color="primary">
              Next
            </Button>
          </div>
        </div>
      </form>
    );
  };

  const renderMachinesStep = (): React.ReactNode => {
    if (!machineState) {
      updateMachineState({});
      return null;
    }

    return (
      <form className="configuration-form" onSubmit={saveMachine}>
        <Typography variant="caption">Please add at least one machine...</Typography>
        <MachineConfigurationForm mode={PersistenceModeType.add} restriction={restriction} state={machineState} updateState={updateMachineState} />
        <div className="configuration-actions">
          <div className="configuration-actions-secondary">
            <Button disabled={!machineState.isValid} onClick={saveMachineAndAddMore}>
              Save &amp; Add More...
            </Button>
          </div>
          <div className="configuration-actions-primary">
            <Button type="submit" disabled={!machineState.isValid} color="primary">
              Next
            </Button>
          </div>
        </div>
      </form>
    );
  };

  const renderSettingsStep = (): React.ReactNode => {
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
  };

  const renderCompleteStep = (): React.ReactNode => {
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
  };

  const renderStep = (): React.ReactNode => {
    switch (currentStep) {
      case 0:
        return renderAdminStep();
      case 1:
        return renderMachinesStep();
      case 2:
        return renderSettingsStep();
      case 3:
        return renderCompleteStep();
      default:
        return null;
    }
  };

  if (isSetup && !setupStarted) {
    history.replace('/');
    return null;
  }

  return (
    <React.Fragment>
      <Typography align="center" variant="h6">
        Before you begin let&apos;s setup Overseer!
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
