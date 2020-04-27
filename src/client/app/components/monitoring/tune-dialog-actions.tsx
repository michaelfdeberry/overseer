import { Slider } from '@material-ui/core';
import { MachineToolType } from '@overseer/common/models';
import * as React from 'react';

import { useDispatch } from '../../hooks';
import { setFanSpeed, setFeedRate, setFlowRate } from '../../operations/local/control.operations.local';
import { invoke } from '../../operations/operation-invoker';
import { MachineMonitorProps } from './machine-monitor-props';

export const TuneDialogActions: React.FunctionComponent<MachineMonitorProps> = ({ machine, machineState }) => {
  const dispatch = useDispatch();

  const onFanSpeedChange = (_event: React.ChangeEvent, fanSpeed: number): void => {
    invoke(dispatch, setFanSpeed(machine.id, fanSpeed)).subscribe();
  };

  const onFeedRateChange = (_event: React.ChangeEvent, feedRate: number): void => {
    invoke(dispatch, setFeedRate(machine.id, feedRate)).subscribe();
  };

  const onFlowRateChange = (extruderIndex: number): ((e: React.ChangeEvent, n: number) => void) => {
    return (_event: React.ChangeEvent, flowRate: number): void => {
      invoke(dispatch, setFlowRate(machine.id, extruderIndex, flowRate)).subscribe();
    };
  };

  return (
    <table className="tune-table">
      <tbody>
        <tr>
          <th colSpan={3}>Fan Speed</th>
        </tr>
        <tr>
          <td colSpan={2}>
            <Slider
              defaultValue={machineState.fanSpeed}
              valueLabelDisplay="auto"
              step={1}
              marks
              min={0}
              max={100}
              onChangeCommitted={onFanSpeedChange}
            />
          </td>
          <td>{machineState.fanSpeed}%</td>
        </tr>
        <tr>
          <th colSpan={3}>Feed Rate</th>
        </tr>
        <tr>
          <td colSpan={2}>
            <Slider
              defaultValue={machineState.feedRate}
              valueLabelDisplay="auto"
              step={1}
              marks
              min={50}
              max={150}
              onChangeCommitted={onFeedRateChange}
            />
          </td>
          <td>{machineState.feedRate}%</td>
        </tr>
        <tr>
          <th colSpan={3}>Flow Rates</th>
        </tr>
        {machine.tools
          .filter(tool => tool.type === MachineToolType.Extruder)
          .map((extruder, index) => {
            const flowRate = machineState.flowRates[extruder.index];

            return (
              <tr key={`action_${index}`} className="flow-rates">
                <th className="capitalize">{extruder.name}</th>
                <td>
                  <Slider
                    defaultValue={flowRate}
                    valueLabelDisplay="auto"
                    step={1}
                    marks
                    min={75}
                    max={125}
                    onChangeCommitted={onFlowRateChange(extruder.index)}
                  />
                </td>
                <td>{flowRate}%</td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
};
