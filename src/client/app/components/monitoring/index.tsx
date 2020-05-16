import Button from '@material-ui/core/Button';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import Typography from '@material-ui/core/Typography';
import Add from '@material-ui/icons/Add';
import OpenInBrowser from '@material-ui/icons/OpenInBrowser';
import Settings from '@material-ui/icons/Settings';
import { MachineStateType, SystemSettings } from '@overseer/common/models';
import { equals } from 'lodash/fp';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { useDispatch, useMediaBreakPoints, useSelector } from '../../hooks';
import { getSettings, updateSettings } from '../../operations/local/configuration.operations.local';
import { getMachines } from '../../operations/local/machines.operations.local';
import { disableMonitoring, enableMonitoring, machineState$ } from '../../operations/local/monitoring.operations.local';
import { invoke } from '../../operations/operation-invoker';
import { actions } from '../../store/actions';
import { MachineMonitor } from './machine-monitor';
import { machineStateSort } from './machine-monitor-sort.function';

export const MonitoringPage: React.FunctionComponent = () => {
  const dispatch = useDispatch();
  const mediaBreakpoints = useMediaBreakPoints();
  const machinesGridRef = React.useRef<HTMLUListElement>();
  const settings = useSelector((state) => state.settings);
  const machines = useSelector((state) => state.machines);
  const machineStates = useSelector((state) => state.machineStates);
  const [gridSpacing, setGridSpacing] = React.useState(1);
  const [visibleMachines, setVisibleMachines] = React.useState([]);
  const [monitorDimensions, setMonitorDimensions] = React.useState<{ columns?: number; cellHeight?: number }>({});

  function updateSetting<T>(settingKey: keyof SystemSettings, value: T): void {
    const updatedSettings = { ...settings, [settingKey]: value };
    invoke(dispatch, updateSettings(updatedSettings), 'Settings Updated!').subscribe(() => {
      dispatch(actions.common.updateSettings(updatedSettings));
    });
  }

  React.useEffect(() => {
    setGridSpacing(mediaBreakpoints.xs ? 0 : 1);
  }, [mediaBreakpoints?.xs]);

  React.useEffect(() => {
    if (settings) return;

    invoke(dispatch, getSettings()).subscribe((settings) => {
      dispatch(actions.common.updateSettings(settings));
    });
  }, [settings]);

  React.useEffect(() => {
    if (machines) return;

    invoke(dispatch, getMachines()).subscribe((machines) => {
      dispatch(actions.machines.updateMachines(machines));
    });
  }, [machines]);

  React.useEffect(() => {
    enableMonitoring();
    const subscription = machineState$.subscribe((state) => {
      dispatch(actions.machines.setMachineState(state));
    });

    return () => {
      subscription.unsubscribe();
      disableMonitoring();
    };
  }, []);

  React.useEffect(() => {
    if (!machines) return;
    if (!settings) return;

    const filteredMachines = machines.filter((machine) => {
      const machineState = machineStates && machineStates[machine.id];

      if (settings.hideIdleMachines && machine.disabled) return false;
      if (settings.hideDisabledMachines && machine.disabled) return false;
      if (settings.hideIdleMachines && machineState && machineState?.type <= MachineStateType.Idle) return false;
      return true;
    });

    if (!equals(visibleMachines, filteredMachines)) {
      setVisibleMachines(filteredMachines);
    }
  }, [machines, machineStates, settings]);

  React.useEffect(() => {
    if (!machinesGridRef.current) return;

    const count = visibleMachines.length;
    const { width: gridWidth, height: gridHeight } = machinesGridRef.current.getBoundingClientRect();
    const defaultAspectRatio = 4 / 3;
    let columns: number;
    let cellHeight: number;

    if (mediaBreakpoints.xs || mediaBreakpoints.sm) {
      columns = 1;
      cellHeight = gridWidth / defaultAspectRatio;
    } else if (count >= 1 && count <= 9) {
      const base = mediaBreakpoints.md ? 2 : 3;
      columns = Math.ceil(count / (Math.floor(count / base) + (count % base > 0 ? 1 : 0)));
      cellHeight = gridHeight / (count / columns) - gridSpacing;
    } else {
      columns = 3;
      cellHeight = gridWidth / columns / defaultAspectRatio;
    }

    const newMonitorDimensions = { columns, cellHeight };
    if (!equals(monitorDimensions, newMonitorDimensions)) {
      setMonitorDimensions(newMonitorDimensions);
    }
  }, [mediaBreakpoints, visibleMachines, machineStates, machinesGridRef.current]);

  if (!machines) return null;
  if (!settings) return null;

  if (!machines.length) {
    return (
      <div className="no-machines-message">
        <div className="message">
          <Typography variant="h6">There are no machines configured, please setup a machine to begin monitoring</Typography>
          <Button color="primary" variant="outlined" component={Link} to="/configuration/machines/add">
            <Add />
            Add Machine
          </Button>
        </div>
      </div>
    );
  }

  if (settings.hideDisabledMachines && machines.every((machine) => machine.disabled)) {
    return (
      <div className="no-machines-message">
        <div className="message">
          <Typography variant="h6">&apos;Hide Disabled Machines&apos; enabled and all machines are currently disabled</Typography>
          <Button color="primary" variant="outlined" onClick={() => updateSetting<boolean>('hideDisabledMachines', false)}>
            <Settings />
            Disable &apos;Hide Disabled Machines&apos;?
          </Button>
          <Button color="primary" variant="outlined" component={Link} to="/configuration/machines">
            <OpenInBrowser />
            Machine Settings
          </Button>
        </div>
      </div>
    );
  }

  if (!visibleMachines.length) {
    const renderHideIdleMachinesMessage = (): React.ReactNode => {
      if (!settings.hideIdleMachines) return null;

      return (
        <React.Fragment>
          <Typography variant="body1">
            This is likely because &apos;Hide Idle Machines&apos; is enabled. Would you like to view idle machines?
          </Typography>
          <Button color="primary" variant="outlined" onClick={() => updateSetting<boolean>('hideIdleMachines', false)}>
            <Settings />
            Disable &apos;Hide Idle Machines&apos;?
          </Button>
        </React.Fragment>
      );
    };

    return (
      <div className="no-machines-message">
        <div className="message">
          <Typography variant="h6">There are no machines available for monitoring</Typography>
          {renderHideIdleMachinesMessage()}
        </div>
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
        .map((machine) => [machine, machineStates[machine.id]])
        .sort(machineStateSort)
        .map(([machine, machineState]) => {
          return (
            <GridListTile key={machine.id}>
              <MachineMonitor machine={machine} machineState={machineState} />
            </GridListTile>
          );
        })}
    </GridList>
  );
};
