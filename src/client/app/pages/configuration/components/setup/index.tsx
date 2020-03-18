import { Button, Step, StepLabel, Stepper, Typography } from '@material-ui/core';
import { AccessLevel, PersistenceModeType } from '@overseer/common/models';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';

import { selectIsInitialSetupRequired } from '../../../../core/store/selectors';
import { AppState } from '../../../../store';
import { configurationActions } from '../../store/actions';
import { selectRestrictionType } from '../../store/selectors';
import { MachineConfigurationForm, MachineConfigurationFormState } from '../machines/machine-configuration-form';
import { ThemeSelector } from '../system/theme-selector';
import { CreateUserForm, CreateUserFormState } from '../users/create-user-form';

export const SetupPage: React.FunctionComponent = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const restriction = useSelector(selectRestrictionType);
  const isSetupRequired = useSelector(selectIsInitialSetupRequired);
  const isSetupPageLoaded = useSelector((state: AppState) => state.configuration.setup?.loaded);
  const currentStep = useSelector((state: AppState) => state.configuration.setup?.currentStep);
  const [userState, updateUserState] = React.useState<CreateUserFormState>({ accessLevel: AccessLevel.Administrator });
  const [machineState, updateMachineState] = React.useState<MachineConfigurationFormState>({});

  if (!isSetupRequired) {
    history.replace('/');
    return null;
  }

  if (!isSetupPageLoaded) {
    dispatch(configurationActions.setup.load());
    return null;
  }

  function saveAdmin(): void {
    const { isValid, ...user } = userState;
    if (currentStep === 0 && isValid) {
      dispatch(configurationActions.setup.submitAdminStep(user));
    }
  }

  function saveMachine(): void {
    if (currentStep === 1 && machineState.isValid) {
      dispatch(configurationActions.setup.submitMachineStep(machineState));
    }
  }

  function saveMachineAndAddMore(): void {
    if (currentStep === 1 && machineState.isValid) {
      dispatch(configurationActions.machines.createMachine(machineState));
    }
  }

  function completeSelectTheme(): void {
    dispatch(configurationActions.setup.completeThemeStep());
  }

  function completeSetup() {
    dispatch(configurationActions.setup.complete());
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
            <Typography variant="h6">Please create an administrator account...</Typography>
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
            <Typography variant="h6">Please add at least one machine...</Typography>
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
            <Typography variant="h6">Please select your preferred theme...</Typography>
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
            <Typography variant="h6">The initial setup for Overseer is now complete, what would you like to do next?</Typography>
            <div className="setup-next-steps">
              <Button color="primary" onClick={completeSetup} component={Link} to="/">
                Start Monitoring
              </Button>
              <Button color="primary" onClick={completeSetup} component={Link} to="/configuration/machines/add">
                Add Machines
              </Button>
              <Button color="primary" onClick={completeSetup} component={Link} to="/configuration/users/add">
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
      <Typography align="center" variant="h5">
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
