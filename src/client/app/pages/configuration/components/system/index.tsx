import { Button, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Switch, Typography } from '@material-ui/core';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { coreActions } from '../../../../core/store/actions';
import { selectSystemSettings } from '../../../../core/store/selectors';
import { pollIntervals } from '../../utils/display-options.class';
import { ThemeSelector } from './theme-selector';

export const SystemSettingsContainer: React.FunctionComponent = () => {
  const dispatch = useDispatch();
  const settings = useSelector(selectSystemSettings);
  const [formState, setFormState] = React.useState(settings);

  React.useEffect(() => {
    if (!settings) {
      dispatch(coreActions.fetchSettings());
    } else {
      setFormState(settings);
    }
  }, [!!settings]);

  function updateForm(event: React.ChangeEvent<HTMLInputElement>) {
    setFormState({ ...formState, [event.target.name]: event.target.value || event.target.checked });
  }

  function saveForm() {
    dispatch(coreActions.updateSettings(formState));
  }

  function resetForm() {
    setFormState(settings);
  }

  if (!formState) {
    return null;
  }

  return (
    <div>
      <form className="configuration-form">
        <Typography variant="h6">Client Settings</Typography>
        <ThemeSelector />
      </form>
      <form className="configuration-form">
        <Typography variant="h6">Application Settings</Typography>
        <FormControl>
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
            <Button disabled={settings == formState} onClick={resetForm}>
              Cancel
            </Button>
            <Button disabled={settings == formState} color="primary" onClick={saveForm}>
              Save
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
