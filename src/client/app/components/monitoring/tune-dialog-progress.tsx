import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import Pause from '@material-ui/icons/Pause';
import PlayArrow from '@material-ui/icons/PlayArrow';
import Stop from '@material-ui/icons/Stop';
import { MachineStateType } from '@overseer/common/lib/models';
import * as React from 'react';

import { useDispatch } from '../../hooks';
import { cancelJob, pauseJob, resumeJob } from '../../operations/local/control.operations.local';
import { invoke } from '../../operations/operation-invoker';
import { toDuration } from '../../utils/duration.function';
import { MachineMonitorProps } from './machine-monitor-props';

export const TuneDialogProgress: React.FunctionComponent<MachineMonitorProps> = ({ machine, machineState }) => {
  const dispatch = useDispatch();

  const renderResumeButton = (): React.ReactNode => {
    if (machineState.type !== MachineStateType.Paused) return;

    return (
      <Button onClick={() => invoke(dispatch, resumeJob(machine.id))}>
        <Icon>
          <PlayArrow />
        </Icon>
      </Button>
    );
  };

  const renderPauseButton = (): React.ReactNode => {
    if (machineState.type !== MachineStateType.Operational) return;

    return (
      <Button onClick={() => invoke(dispatch, pauseJob(machine.id))}>
        <Icon>
          <Pause />
        </Icon>
      </Button>
    );
  };

  return (
    <div className="progress-container">
      <div className="progress">
        <Typography>Progress</Typography>
        <div>
          <LinearProgress variant="determinate" color="secondary" value={machineState.progress} />
        </div>
        <div className="times">
          <span className="elapsed-time">{toDuration(machineState.elapsedTime)} Elapsed</span>
          <span className="estimated-time">{toDuration(machineState.estimatedRemainingTime)} Remaining</span>
        </div>
      </div>
      <div className="progress-actions">
        {renderPauseButton()}
        {renderResumeButton()}
        <Button onClick={() => invoke(dispatch, cancelJob(machine.id))}>
          <Icon>
            <Stop />
          </Icon>
        </Button>
      </div>
    </div>
  );
};
