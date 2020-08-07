import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Icon from '@material-ui/core/Icon';
import OpenInNew from '@material-ui/icons/OpenInNew';
import { MachineStateType } from '@overseer/common/lib/models';
import * as React from 'react';

import { MachineMonitorProps } from './machine-monitor-props';
import { TuneDialogActions } from './tune-dialog-actions';
import { TuneDialogProgress } from './tune-dialog-progress';
import { TuneDialogTemps } from './tune-dialog-temps';

export type TuneDialogProps = MachineMonitorProps & { openState: boolean; setOpenState: (state: boolean) => void };

export const TuneDialog: React.FunctionComponent<TuneDialogProps> = ({ openState, setOpenState, machine, machineState }) => {
  const renderWebsiteLink = (): React.ReactNode => {
    const url = machine.get('Url');
    if (!url) return null;

    return (
      <div className="title-right">
        <a className="machine-website" href={url}>
          Open Website
          <Icon>
            <OpenInNew />
          </Icon>
        </a>
      </div>
    );
  };

  if (!machine) return null;
  if (!machineState) return null;
  if (machineState.type <= MachineStateType.Idle) return null;

  return (
    <Dialog className="tune-dialog" maxWidth="md" open={openState} onClose={() => setOpenState(false)}>
      <DialogTitle>
        <div className="title-left">
          <span className="name">{machine.name}</span>
        </div>
        {renderWebsiteLink()}
      </DialogTitle>
      <DialogContent>
        <div>
          <TuneDialogProgress machine={machine} machineState={machineState} />
          <div className="tuning-container">
            <div>
              <TuneDialogTemps machine={machine} machineState={machineState} />
            </div>
            <div>
              <TuneDialogActions machine={machine} machineState={machineState} />
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenState(false)} color="primary">
          Dismiss
        </Button>
      </DialogActions>
    </Dialog>
  );
};
