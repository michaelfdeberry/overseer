import { Button, Step, StepLabel, Stepper, Typography } from '@material-ui/core';
import { AccessLevel, ContextType } from '@overseer/common/models';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppState } from '../../../../store';
import { CreateUserFormState } from '../../store/form-states/create-user-form.state';
import { MachineConfigurationFormState } from '../../store/form-states/machine-configuration-form.state';
import { configurationActions } from '../../store/state';
import { MachineConfigurationForm } from '../machines/machine-configuration-form';
import { CreateUserForm } from '../users/create-user-form';

export const SetupPage: React.FunctionComponent = () => {
  const dispatch = useDispatch();
  const isSetupPageLoaded = useSelector((state: AppState) => state.configuration?.setupPageLoaded);
  const currentStep = useSelector((state: AppState) => state.configuration?.setupPageCurrentStep);
  const userState = useSelector((state: AppState) => state.configuration.createUserState);
  const machineState = useSelector((state: AppState) => state.configuration.createMachinesState);
  const updateUserState = (userState: CreateUserFormState) => dispatch(configurationActions.updateCreateUserState(userState));
  const updateMachineState = (machineState: MachineConfigurationFormState) => dispatch(configurationActions.updateCreateMachineState(machineState));

  if (!isSetupPageLoaded) {
    dispatch(configurationActions.loadSetupPage());
    return null;
  }

  function saveUser(): void {
    if (currentStep === 0 && userState.isValid) {
      dispatch(configurationActions.submitUserStep(userState));
    }
  }

  function saveMachine(): void {
    if (currentStep === 1 && machineState.isValid) {
      dispatch(configurationActions.submitMachineStep(machineState));
    }
  }

  function saveMachineAndAddMore(): void {
    if (currentStep === 1 && machineState.isValid) {
      dispatch(configurationActions.startCreateMachine(machineState));
    }
  }

  function applyTheme(): void {}

  function renderStep() {
    if (currentStep === 0) {
      if (!userState) {
        updateUserState({ accessLevel: AccessLevel.Administrator });
        return null;
      }

      return (
        <form className="configuration-form" onSubmit={saveUser}>
          <Typography variant="h6">Please create a user account...</Typography>
          <CreateUserForm disableAccessLevel state={userState} updateState={updateUserState} />
          <div className="configuration-actions">
            <div className="configuration-actions-secondary"></div>
            <div className="configuration-actions-primary">
              <Button disabled={!userState.isValid} variant="contained" color="primary" onClick={saveUser}>
                Next
              </Button>
            </div>
          </div>
        </form>
      );
    }

    if (currentStep === 1) {
      if (!machineState) {
        updateMachineState({});
        return null;
      }

      return (
        <form className="configuration-form" onSubmit={saveMachine}>
          <MachineConfigurationForm currentContext={ContextType.add} state={machineState} updateState={updateMachineState} />
          <div className="configuration-actions">
            <div className="configuration-actions-secondary">
              <Button disabled={!machineState.isValid} variant="contained" onClick={saveMachineAndAddMore}>
                Save &amp; Add More...
              </Button>
            </div>
            <div className="configuration-actions-primary">
              <Button disabled={!machineState.isValid} variant="contained" color="primary" onClick={saveMachine}>
                Next
              </Button>
            </div>
          </div>
        </form>
      );
    }
  }

  return (
    <React.Fragment>
      <Typography variant="h5">Before you begin let's setup Overseer!</Typography>
      <Stepper activeStep={currentStep}>
        <Step>
          <StepLabel>Create User</StepLabel>
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
