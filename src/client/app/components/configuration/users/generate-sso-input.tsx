import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Tooltip from '@material-ui/core/Tooltip';
import Autorenew from '@material-ui/icons/Autorenew';
import FileCopy from '@material-ui/icons/FileCopy';
import { AccessLevel, DisplayUser } from '@overseer/common/lib/models';
import * as React from 'react';

import { useDispatch, useSelector } from '../../../hooks';
import { getPreauthenticatedToken } from '../../../operations/local/authentication.operations.local';
import { actions } from '../../../store/actions';

export const GenerateSsoInput: React.FunctionComponent<{ user: DisplayUser }> = ({ user: { id, accessLevel } }) => {
  const dispatch = useDispatch();
  const isLocalApp = useSelector((state) => state.isLocalApp);
  const [isGeneratingPreauthUrl, setIsGeneratingPreauthUrl] = React.useState(false);
  const [preauthUrl, setPreauthUrl] = React.useState('');
  const preauthUrlInputRef = React.useRef<HTMLInputElement | null>(null);

  const generatePreauthUrl = React.useCallback(
    (generate: boolean) => {
      if (isGeneratingPreauthUrl) return;

      setIsGeneratingPreauthUrl(generate);
      getPreauthenticatedToken(id).subscribe((token) => {
        setPreauthUrl(`${window.location.origin}/sso?token=${token}`);
        dispatch(actions.layout.notifyInfo('Preauthenticated URL Generated!'));
      });
    },
    [isGeneratingPreauthUrl]
  );

  const copyToClipboard = (input: HTMLInputElement): void => {
    input.select();
    document.execCommand('copy');
    input.setSelectionRange(0, 0);
    dispatch(actions.layout.notifyInfo('Copied to clipboard!'));
  };

  if (isLocalApp) return null;
  if (accessLevel !== AccessLevel.Readonly) return null;

  return (
    <FormControl fullWidth>
      <InputLabel htmlFor="preauth-url">Preauthenticated URL</InputLabel>
      <Input inputRef={preauthUrlInputRef} fullWidth readOnly id="preauth-url" value={preauthUrl} />
      <div className="input-actions">
        {preauthUrl ? (
          <Tooltip arrow title="Copy">
            <IconButton onClick={() => copyToClipboard(preauthUrlInputRef.current)}>
              <FileCopy />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip arrow title="Generate">
            <IconButton disabled={isGeneratingPreauthUrl} onClick={() => generatePreauthUrl(true)}>
              <Autorenew />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </FormControl>
  );
};
