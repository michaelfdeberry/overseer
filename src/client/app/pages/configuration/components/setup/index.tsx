import { Button, Step, StepLabel, Stepper, Typography } from '@material-ui/core';
import { AccessLevel, ContextType } from 'overseer_lib';
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
  const [userState, setUserState] = React.useState<CreateUserFormState>({ accessLevel: AccessLevel.Administrator });
  const [machineState, setMachineState] = React.useState<MachineConfigurationFormState>({});

  if (!isSetupPageLoaded) {
    dispatch(configurationActions.loadSetupPage());
    return null;
  }

  function saveUser(): void {
    if (currentStep === 0 && userState.isValid) {
      dispatch(configurationActions.startCreateUser(userState));
    }
  }

  function saveMachine(): void {}

  function saveMachineAndAddMore(): void {}

  function applyTheme(): void {}

  function renderStep() {
    if (currentStep === 0) {
      return (
        <React.Fragment>
          <form className="configuration-form">
            <Typography variant="h6">Please create a user account...</Typography>
            <CreateUserForm disableAccessLevel state={userState} updateState={setUserState} />
            <div className="configuration-actions">
              <div className="configuration-actions-secondary"></div>
              <div className="configuration-actions-primary">
                <Button disabled={!userState.isValid} variant="contained" color="primary" onClick={saveUser}>
                  Next
                </Button>
              </div>
            </div>
          </form>
        </React.Fragment>
      );
    }

    if (currentStep === 1) {
      return (
        <React.Fragment>
          <form className="configuration-form">
            <MachineConfigurationForm currentContext={ContextType.add} state={machineState} updateState={setMachineState} />
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
        </React.Fragment>
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
