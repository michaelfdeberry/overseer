import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import { SystemSettings } from '@overseer/common/models';
import { isEqual } from 'lodash/fp';
import * as React from 'react';

import { useDispatch, useSelector } from '../../../hooks';
import { getSettings, updateSettings } from '../../../operations/local/configuration.operations.local';
import { invoke } from '../../../operations/operation-invoker';
import { actions } from '../../../store/actions';
import { pollIntervals } from '../../../utils/display-options.class';
import { ThemeSelector } from './theme-selector';

export const SystemSettingsContainer: React.FunctionComponent = () => {
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.settings);
  const [formState, setFormState] = React.useState<SystemSettings>(settings);

  const updateForm = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setFormState({ ...formState, [event.target.name]: event.target.value || event.target.checked });
  };

  const saveForm = (event: React.FormEvent): void => {
    event.preventDefault();

    invoke(dispatch, updateSettings(formState), 'Settings Updated!').subscribe(() => {
      dispatch(actions.common.updateSettings(formState));
    });
  };

  const resetForm = (): void => {
    setFormState(settings);
  };

  React.useEffect(() => {
    if (!settings) {
      invoke(dispatch, getSettings()).subscribe((s) => dispatch(actions.common.updateSettings(s)));
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
      <form className="configuration-form" onSubmit={saveForm}>
        <Typography variant="caption">Application Settings</Typography>
        <FormControl fullWidth>
          <InputLabel id="interval-label">Polling Interval</InputLabel>
          <Select fullWidth name="interval" labelId="interval-label" value={formState.interval} onChange={updateForm}>
            {pollIntervals.map((item) => {
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
            control={<Switch name="hideDisabledMachines" checked={formState.hideDisabledMachines} onChange={updateForm} color="secondary" />}
          />
        </div>
        <div className="switch-container">
          <FormControlLabel
            label="Hide Idle Machines"
            control={<Switch name="hideIdleMachines" checked={formState.hideIdleMachines} onChange={updateForm} color="secondary" />}
          />
        </div>
        <div className="switch-container">
          <FormControlLabel
            label="Sort By Estimated Time Remaining"
            control={<Switch name="sortByTimeRemaining" checked={formState.sortByTimeRemaining} onChange={updateForm} color="secondary" />}
          />
        </div>
        <div className="configuration-actions">
          <div className="configuration-actions-secondary"></div>
          <div className="configuration-actions-primary">
            <Button disabled={isEqual(settings, formState)} onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" disabled={isEqual(settings, formState)} color="primary">
              Save
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
