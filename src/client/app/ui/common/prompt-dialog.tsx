import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import React from 'react';

type PromptDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  message?: string;
  confirmButtonText?: string;
  declineButtonText?: string;
  onConfirm?: () => void;
  onDecline?: () => void;
};

export const PromptDialog: React.FunctionComponent<PromptDialogProps> = props => {
  const {
    open,
    setOpen,
    title = 'Warning!',
    message = 'Are you sure you would like to complete this action?',
    confirmButtonText = 'Yes',
    declineButtonText = 'No',
    onConfirm,
    onDecline,
  } = props;

  const confirm = (): void => {
    if (onConfirm) onConfirm();
    setOpen(false);
  };

  const decline = (): void => {
    if (onDecline) onDecline();
    setOpen(false);
  };

  return (
    <div>
      <Dialog open={open} onClose={decline} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={decline}>{declineButtonText}</Button>
          <Button onClick={confirm} color="primary" autoFocus>
            {confirmButtonText}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
