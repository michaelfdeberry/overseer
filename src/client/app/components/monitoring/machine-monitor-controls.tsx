import { Button, Icon } from '@material-ui/core';
import { Build, Pause, PlayArrow, Settings, Stop } from '@material-ui/icons';
import { AccessLevel, MachineStateType } from '@overseer/common/models';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { useDispatch, useSelector } from '../../hooks';
import { cancelJob, pauseJob, resumeJob } from '../../operations/local/control.operations.local';
import { invoke } from '../../operations/operation-invoker';
import { PromptDialog } from '../common/prompt-dialog';
import { MachineMonitorProps } from './machine-monitor-props';

export const MachineMonitorControls: React.FunctionComponent<MachineMonitorProps> = props => {
  const dispatch = useDispatch();
  const activeUser = useSelector(state => state.activeUser);
  const [confirmCancel, setConfirmCancel] = React.useState(false);
  const [isTuneDialogOpen, setIsTuneDialogOpen] = React.useState(false);

  const isOperational = (): boolean => {
    return props.machineState?.type === MachineStateType.Operational || props.machineState?.type === MachineStateType.Paused;
  };

  const pause = (): void => {
    invoke(dispatch, pauseJob(props.machine.id)).subscribe();
  };

  const resume = (): void => {
    invoke(dispatch, resumeJob(props.machine.id)).subscribe();
  };

  const cancel = (): void => {
    invoke(dispatch, cancelJob(props.machine.id)).subscribe();
  };

  const renderPauseButton = (): React.ReactNode => {
    if (props.machineState?.type !== MachineStateType.Operational) return null;
    return (
      <Button className="pause" variant="contained" onClick={pause}>
        <Icon>
          <Pause />
        </Icon>
      </Button>
    );
  };

  const renderResumeButton = (): React.ReactNode => {
    if (props.machineState?.type !== MachineStateType.Paused) return null;
    return (
      <Button className="resume" variant="contained" onClick={resume}>
        <Icon>
          <PlayArrow />
        </Icon>
      </Button>
    );
  };

  const renderTuneButton = (): React.ReactNode => {
    if (!isOperational()) return null;
    return (
      <Button className="tune" variant="contained" onClick={() => setIsTuneDialogOpen(true)}>
        <Icon>
          <Build />
        </Icon>
      </Button>
    );
  };

  const renderCancelButton = (): React.ReactNode => {
    if (!isOperational()) return null;
    return (
      <Button className="cancel" variant="contained" onClick={() => setConfirmCancel(true)}>
        <Icon>
          <Stop />
        </Icon>
      </Button>
    );
  };

  const renderSettingsButton = (): React.ReactNode => {
    if (isOperational()) return null;
    return (
      <Button className="settings" variant="contained" component={Link} to={`/configuration/machines/edit/${props.machine.id}`}>
        <Icon>
          <Settings />
        </Icon>
      </Button>
    );
  };

  if (!activeUser) return null;
  if (activeUser.accessLevel === AccessLevel.Readonly) return null;

  return (
    <div className="controls">
      {renderPauseButton()}
      {renderResumeButton()}
      {renderCancelButton()}
      {renderTuneButton()}
      {renderSettingsButton()}
      <PromptDialog open={confirmCancel} setOpen={setConfirmCancel} message="Are you sure you want to cancel this job?" onConfirm={cancel} />
    </div>
  );
};
