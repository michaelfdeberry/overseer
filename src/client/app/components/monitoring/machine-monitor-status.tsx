import { Typography } from '@material-ui/core';
import { MachineStateType } from '@overseer/common/models';
import * as React from 'react';

import { toDuration } from '../../utils/duration.function';
import { MachineMonitorProps } from './machine-monitor-props';

export const MachineMonitorStatus: React.FunctionComponent<MachineMonitorProps> = props => {
  const renderDuration = () => {
    if (!props.machineState) return null;
    if (props.machineState.type <= MachineStateType.Idle) return null;

    return <span>({toDuration(props.machineState?.estimatedRemainingTime)} Remaining)</span>;
  };

  const renderTemplate = (machineStateType: MachineStateType) => {
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
    return renderTemplate(MachineStateType.Disabled);
  }

  if (!props.machineState) {
    return renderTemplate(MachineStateType.Connecting);
  }

  return renderTemplate(props.machineState.type);
};
