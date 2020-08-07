import Typography from '@material-ui/core/Typography';
import { MachineStateType } from '@overseer/common/lib/models';
import * as React from 'react';

import { toDuration } from '../../utils/duration.function';
import { MachineMonitorProps } from './machine-monitor-props';

export const MachineMonitorStatus: React.FunctionComponent<MachineMonitorProps> = (props) => {
  const renderDuration = (): React.ReactElement => {
    if (!props.machineState) return null;
    if (props.machineState.type <= MachineStateType.Idle) return null;

    return <span>({toDuration(props.machineState?.estimatedRemainingTime)} Remaining)</span>;
  };

  const render = (machineStateType: MachineStateType): React.ReactElement => {
    return (
      <div className="status">
        <Typography className="name" variant="h6">
          {props.machine.name}
        </Typography>
        <Typography className="state" variant="caption">
          {MachineStateType[machineStateType]}
          {renderDuration()}
        </Typography>
      </div>
    );
  };

  if (props.machine.disabled) {
    return render(MachineStateType.Disabled);
  }

  if (!props.machineState) {
    return render(MachineStateType.Connecting);
  }

  return render(props.machineState.type);
};
