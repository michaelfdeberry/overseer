import { LinearProgress } from '@material-ui/core';
import { MachineStateType } from '@overseer/common/models';
import * as React from 'react';

import { MachineMonitorControls } from './machine-monitor-controls';
import { MachineMonitorProps } from './machine-monitor-props';
import { MachineMonitorStatus } from './machine-monitor-status';
import { MachineMonitorTemps } from './machine-monitor-temps';

export const MachineMonitor: React.FunctionComponent<MachineMonitorProps> = props => {
  const scaleRatioPerFrame = 0.15;
  const zoomPanelRef = React.useRef<HTMLDivElement>();
  const [zoomState, setZoomState] = React.useState<boolean>(undefined);
  const machineWebsiteUrl = React.useMemo(() => props.machine.get('Url'), [props.machine]);

  const progressVariant = (): 'determinate' | 'indeterminate' => {
    if (props.machine.disabled) return 'determinate';
    if (!props.machineState) return 'indeterminate';
    if (props.machineState.type === MachineStateType.Connecting) return 'indeterminate';

    return 'determinate';
  };

  const zoomIn = (): void => {
    const zoomPanelBounds = zoomPanelRef.current.getBoundingClientRect();
    const deltaTop = zoomPanelBounds.top * scaleRatioPerFrame;
    const deltaLeft = zoomPanelBounds.left * scaleRatioPerFrame;
    const deltaHeight = (window.innerHeight - zoomPanelRef.current.clientHeight) * scaleRatioPerFrame;
    const deltaWidth = (window.innerWidth - zoomPanelRef.current.clientWidth) * scaleRatioPerFrame;
    zoomPanelRef.current.dataset.initialTop = zoomPanelBounds.top.toString();
    zoomPanelRef.current.dataset.initialLeft = zoomPanelBounds.left.toString();
    zoomPanelRef.current.dataset.initialHeight = zoomPanelRef.current.clientHeight.toString();
    zoomPanelRef.current.dataset.initialWidth = zoomPanelRef.current.clientWidth.toString();
    zoomPanelRef.current.style.top = `${zoomPanelBounds.top}px`;
    zoomPanelRef.current.style.left = `${zoomPanelBounds.left}px`;
    zoomPanelRef.current.style.height = `${zoomPanelRef.current.clientHeight}px`;
    zoomPanelRef.current.style.width = `${zoomPanelRef.current.clientWidth}px`;
    zoomPanelRef.current.style.position = 'fixed';
    zoomPanelRef.current.classList.toggle('zoom');

    function animate(): void {
      const bounds = zoomPanelRef.current.getBoundingClientRect();
      if (bounds.top === 0 && bounds.left === 0 && bounds.height === window.innerHeight && bounds.width === window.innerWidth) return;

      zoomPanelRef.current.style.top = `${Math.max(0, bounds.top - deltaTop)}px`;
      zoomPanelRef.current.style.left = `${Math.max(0, bounds.left - deltaLeft)}px`;
      zoomPanelRef.current.style.height = `${Math.min(window.innerHeight, bounds.height + deltaHeight)}px`;
      zoomPanelRef.current.style.width = `${Math.min(window.innerWidth, bounds.width + deltaWidth)}px`;
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  };

  const zoomOut = (): void => {
    const top = parseFloat(zoomPanelRef.current.dataset.initialTop);
    const left = parseFloat(zoomPanelRef.current.dataset.initialLeft);
    const height = parseFloat(zoomPanelRef.current.dataset.initialHeight);
    const width = parseFloat(zoomPanelRef.current.dataset.initialWidth);
    const deltaTop = top * scaleRatioPerFrame;
    const deltaLeft = left * scaleRatioPerFrame;
    const deltaHeight = (zoomPanelRef.current.clientHeight - height) * scaleRatioPerFrame;
    const deltaWidth = (zoomPanelRef.current.clientWidth - width) * scaleRatioPerFrame;

    function animate(): void {
      const bounds = zoomPanelRef.current.getBoundingClientRect();
      if (bounds.top === top && bounds.left === left && bounds.height === height && bounds.width === width) {
        zoomPanelRef.current.style.top = '';
        zoomPanelRef.current.style.left = '';
        zoomPanelRef.current.style.height = '';
        zoomPanelRef.current.style.width = '';
        zoomPanelRef.current.style.position = '';
        zoomPanelRef.current.classList.toggle('zoom');
        return;
      }

      zoomPanelRef.current.style.top = `${Math.min(top, bounds.top + deltaTop)}px`;
      zoomPanelRef.current.style.left = `${Math.min(left, bounds.left + deltaLeft)}px`;
      zoomPanelRef.current.style.height = `${Math.max(height, bounds.height - deltaHeight)}px`;
      zoomPanelRef.current.style.width = `${Math.max(width, bounds.width - deltaWidth)}px`;
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  };

  React.useEffect(() => {
    if (zoomState === undefined) return;

    if (zoomState) {
      zoomIn();
    } else {
      zoomOut();
    }
  }, [zoomState]);

  return (
    <div className="machine">
      <div className="zoom-panel" ref={zoomPanelRef}>
        <div className="content">
          <LinearProgress color="secondary" variant={progressVariant()} value={props.machineState?.progress || 0} />
          <div
            className={`web-cam ${props.machine.webcamOrientation}`}
            style={{ backgroundImage: `url(${props.machine.webcamUrl})` }}
            onClick={() => setZoomState(!zoomState)}
          ></div>
          <div className="head">
            <MachineMonitorStatus {...props} />
            <MachineMonitorControls {...props} />
          </div>
          <div className="foot">
            {machineWebsiteUrl ? (
              <a href={machineWebsiteUrl} title="Open Website" target="_blank" rel="noreferrer">
                <img className="machine-type-logo" src={`/images/${props.machine.type}.png`} alt="logo" />
              </a>
            ) : (
              <img className="machine-type-logo" src={`/images/${props.machine.type}.png`} alt="logo" />
            )}
            <MachineMonitorTemps {...props} />
          </div>
        </div>
      </div>
    </div>
  );
};
