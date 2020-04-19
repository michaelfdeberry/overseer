import { Typography } from '@material-ui/core';
import { MachineToolType } from '@overseer/common/models';
import * as React from 'react';

import { sortByKey } from '../../utils/sort.functions';
import BedIcon from './icons/bed.svg';
import ChamberIcon from './icons/chamber.svg';
import NozzleIcon from './icons/nozzle.svg';
import { MachineMonitorProps } from './machine-monitor-props';

export const MachineMonitorTemps: React.FunctionComponent<MachineMonitorProps> = props => {
  const renderIcon = (heater): React.ReactNode => {
    switch (heater.name) {
      case 'bed':
        return <BedIcon />;
      case 'nozzle':
        return <NozzleIcon />;
      default:
        return <ChamberIcon />;
    }
  };

  return (
    <div className="temps">
      {props.machine.tools
        .filter(t => t.type === MachineToolType.Heater)
        .sort(sortByKey('name'))
        .map(heater => {
          const temps = props.machineState?.temperatures || {};
          const temp = temps[heater.index];

          return (
            <div key={`heater-index-${heater.index}`} className={`temp ${heater.name}`} title={heater.name}>
              <span className="heater-icon">{renderIcon(heater)}</span>
              <span className="heater-index">{heater.index}</span>
              <div className="heater-temps">
                <Typography variant="caption">
                  {temp?.actual || 0} / {temp?.target || 0}
                  <sup>&deg;C</sup>
                </Typography>
              </div>
            </div>
          );
        })}
    </div>
  );
};
