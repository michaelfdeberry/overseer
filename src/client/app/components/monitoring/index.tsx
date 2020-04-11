import { Button, GridList, GridListTile, Icon, Typography } from '@material-ui/core';
import { Add, Settings } from '@material-ui/icons';
import { MachineStateType } from '@overseer/common/models';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { useDispatch, useMediaBreakPoints, useSelector } from '../../hooks';
import { getSettings } from '../../operations/local/configuration.operations.local';
import { getMachines } from '../../operations/local/machines.operations.local';
import { enableMonitoring, machineState$ } from '../../operations/local/monitoring.operations.local';
import { invoke } from '../../operations/operation-invoker';
import { actions } from '../../store/actions';
import { MachineMonitor } from './machine-monitor';
import { machineStateSort } from './machine-monitor-sort.function';

export const MonitoringPage: React.FunctionComponent = () => {
  const gridSpacing: number = 1;
  const dispatch = useDispatch();
  const mediaBreakpoints = useMediaBreakPoints();
  const machinesGridRef = React.useRef<HTMLElement>();
  const settings = useSelector(state => state.settings);
  const machines = useSelector(state => state.machines);
  const machineStates = useSelector(state => state.machineStates);

  const visibleMachines = React.useMemo(() => {
    if (!machines) return [];
    if (!settings) return [];

    return machines.filter(machine => {
      if (settings.hideDisabledMachines && machine.disabled) return false;
      if (settings.hideIdleMachines && machineStates && machineStates[machine.id].type <= MachineStateType.Idle) return false;
      return true;
    });
  }, [machines, machineStates]);

  const monitorDimensions = React.useMemo(() => {
    if (!machinesGridRef.current) return {};

    const count = visibleMachines.length;
    const { width: gridWidth, height: gridHeight } = machinesGridRef.current.getBoundingClientRect();
    const aspect = 4 / 3;
    let columns: number;
    let cellHeight: number;

    if (mediaBreakpoints.xs || mediaBreakpoints.sm) {
      columns = 1;
      cellHeight = gridWidth / aspect;
    } else if (count >= 1 && count <= 9) {
      const base = mediaBreakpoints.md ? 2 : 3;
      columns = Math.ceil(count / (Math.floor(count / base) + (count % base > 0 ? 1 : 0)));
      cellHeight = gridHeight / (count / columns) - gridSpacing;
    } else {
      columns = 3;
      cellHeight = gridWidth / columns / aspect;
    }

    return { columns, cellHeight };
  }, [mediaBreakpoints, visibleMachines.length, machineStates, machinesGridRef.current]);

  React.useEffect(() => {
    if (!settings) {
      invoke(dispatch, getSettings()).subscribe(settings => {
        dispatch(actions.common.updateSettings(settings));
      });
    }
  }, [settings]);

  React.useEffect(() => {
    if (!machines) {
      invoke(dispatch, getMachines()).subscribe(machines => {
        dispatch(actions.machines.updateMachines(machines));
      });
    }
  }, [machines]);

  React.useEffect(() => {
    enableMonitoring().subscribe();
    const subscription = machineState$.subscribe(state => {
      dispatch(actions.machines.setMachineState(state));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!machines) return null;

  if (!machines.length) {
    return (
      <div className="no-machines-message">
        <Typography variant="h6">There are no machines configured, please setup a machine to begin monitoring</Typography>
        <Button component={Link} to="/configuration/machines/add">
          <Icon>
            <Add />
          </Icon>
          Add Machine
        </Button>
      </div>
    );
  }

  if (machines.every(machine => machine.disabled)) {
    return (
      <div className="no-machines-message">
        <Typography variant="h6">All machines are currently disabled, please enable your machines to begin monitoring</Typography>
        <Button component={Link} to="/configuration/machines">
          <Icon>
            <Settings />
          </Icon>
          Enable Machines
        </Button>
      </div>
    );
  }

  return (
    <GridList
      ref={machinesGridRef}
      className="machines"
      spacing={gridSpacing}
      cols={monitorDimensions.columns}
      cellHeight={monitorDimensions.cellHeight}
    >
      {visibleMachines
        .sort((m1, m2) => {
          if (settings.sortByTimeRemaining) {
            return machineStateSort([m1, machineStates[m1.id]], [m2, machineStates[m2.id]]);
          }

          return m1.sortIndex > m2.sortIndex ? 1 : -1;
        })
        .map(machine => {
          return (
            <GridListTile key={machine.id}>
              <MachineMonitor machine={machine} machineState={machineStates[machine.id]} />
            </GridListTile>
          );
        })}
    </GridList>
  );
};
