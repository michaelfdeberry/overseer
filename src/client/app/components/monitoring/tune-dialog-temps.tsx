import { Button, Icon } from '@material-ui/core';
import { Add, Remove } from '@material-ui/icons';
import { MachineToolType } from '@overseer/common/models';
import * as React from 'react';

import { useDispatch } from '../../hooks';
import { setTemperature } from '../../operations/local/control.operations.local';
import { invoke } from '../../operations/operation-invoker';
import { MachineMonitorProps } from './machine-monitor-props';

export const TuneDialogTemps: React.FunctionComponent<MachineMonitorProps> = ({ machine, machineState }) => {
  const dispatch = useDispatch();

  const getActualTempClassName = (temp: { target: number; actual: number }): string => {
    if (temp.target !== 0 && temp.actual / temp.target > 0.85) return 'actual-temp hot';
    if (temp.target !== 0 && temp.actual / temp.target > 0.5) return 'actual-temp warm';
    return 'actual-temp';
  };

  return (
    <table className="temp-table">
      <thead>
        <tr>
          <th></th>
          <th>Actual</th>
          <th>Target</th>
        </tr>
      </thead>
      <tbody>
        {machine.tools
          .filter(tool => tool.type === MachineToolType.Heater)
          .map((heater, index) => {
            const temp = machineState.temperatures[heater.index];

            return (
              <tr key={`temp_${index}`}>
                <th className="name capitalize">
                  <span>{heater.name}</span>
                  <span>{heater.index}</span>
                </th>
                <td className={getActualTempClassName(temp)}>
                  {temp.actual.toFixed(1)}
                  <sup>&deg;C</sup>
                </td>
                <td className="target-temp">
                  <Button onClick={() => invoke(dispatch, setTemperature(machine.id, index, temp.target - 1)).subscribe()}>
                    <Icon>
                      <Remove />
                    </Icon>
                  </Button>
                  <span>
                    {temp.target}
                    <sup>&deg;C</sup>
                  </span>
                  <Button onClick={() => invoke(dispatch, setTemperature(machine.id, index, temp.target + 1)).subscribe()}>
                    <Icon>
                      <Add />
                    </Icon>
                  </Button>
                </td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
};
