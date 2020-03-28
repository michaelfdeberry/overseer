import { Button, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Switch, Typography } from '@material-ui/core';
import { SystemSettings } from '@overseer/common/models';
import { isEqual } from 'lodash/fp';
import * as React from 'react';

import { useDispatch, useSelector } from '../../../../hooks';
import { getSettings, updateSettings } from '../../../../operations/local/configuration.operations.local';
import { invokeOperation } from '../../../../operations/operation-invoker';
import { actions } from '../../../../store/actions';
import { pollIntervals } from '../../utils/display-options.class';
import { ThemeSelector } from './theme-selector';

export const SystemSettingsContainer: React.FunctionComponent = () => {
  const dispatch = useDispatch();
  const settings = useSelector(state => state.settings);
  const [formState, setFormState] = React.useState<SystemSettings>(settings);

  const updateForm = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setFormState({ ...formState, [event.target.name]: event.target.value || event.target.checked });
  };

  const saveForm = (): void => {
    invokeOperation(dispatch, updateSettings(formState), 'Settings Updated!').subscribe(() => {
      dispatch(actions.common.updateSettings(formState));
    });
  };

  const resetForm = (): void => {
    setFormState(settings);
  };

  React.useEffect(() => {
    if (!settings) {
      invokeOperation(dispatch, getSettings()).subscribe(s => dispatch(actions.common.updateSettings(s)));
    } else {
      setFormState(settings);
    }
  }, [!!settings]);

  if (!formState) {
    return null;
  }

  return (
    <div>
      <form className="configuration-form">
        <Typography variant="caption">Client Settings</Typography>
        <ThemeSelector />
      </form>
      <form className="configuration-form">
        <Typography variant="caption">Application Settings</Typography>
        <FormControl fullWidth>
          <InputLabel id="interval-label">Polling Interval</InputLabel>
          <Select fullWidth name="interval" labelId="interval-label" value={formState.interval} onChange={updateForm}>
            {pollIntervals.map(item => {
              return (
                <MenuItem key={item.text} value={item.value}>
                  {item.text}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <div className="switch-container">
          <FormControlLabel
            label="Hide Disabled Machines"
            control={<Switch name="hideDisabledMachines" checked={formState.hideDisabledMachines} onChange={updateForm} color="primary" />}
          />
        </div>
        <div className="switch-container">
          <FormControlLabel
            label="Hide Idle Machines"
            control={<Switch name="hideIdleMachines" checked={formState.hideIdleMachines} onChange={updateForm} color="primary" />}
          />
        </div>
        <div className="switch-container">
          <FormControlLabel
            label="Sort By Estimated Time Remaining"
            control={<Switch name="sortByTimeRemaining" checked={formState.sortByTimeRemaining} onChange={updateForm} color="primary" />}
          />
        </div>
        <div className="configuration-actions">
          <div className="configuration-actions-secondary"></div>
          <div className="configuration-actions-primary">
            <Button disabled={isEqual(settings, formState)} onClick={resetForm}>
              Cancel
            </Button>
            <Button disabled={isEqual(settings, formState)} color="primary" onClick={saveForm}>
              Save
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
