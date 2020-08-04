import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';

import { useDispatch } from '../../../hooks';
import { getApplicationInfo } from '../../../operations/local/configuration.operations.local';
import { invoke } from '../../../operations/operation-invoker';

export const AboutPage: React.FunctionComponent = () => {
  const dispatch = useDispatch();
  const [appInfo, setAppInfo] = React.useState<{ [key: string]: string }>();
  const currentYear = React.useMemo(() => new Date().getFullYear(), []);

  React.useEffect(() => {
    invoke(dispatch, getApplicationInfo()).subscribe((info) => {
      setAppInfo(info);
    });
  }, []);

  if (!appInfo) return null;

  return (
    <form className="about">
      <Typography variant="body1">
        Overseer is a utility that allows you to monitor multiple automated machines, such as 3D Printers, from a single web interface.
      </Typography>
      <Typography variant="body1">
        <span>Have a suggestion, a request, or just need some help? Please create an item in the </span>{' '}
        <Link href="https://github.com/michaelfdeberry/overseer/issues" target="_blank" rel="noreferrer">
          Overseer issue tracker
        </Link>
        . Please include the following information along with the log file if you are reporting an issue.
      </Typography>
      <Typography variant="h6" align="center">
        Application Details
      </Typography>
      <div className="app-info">
        <table>
          {Object.keys(appInfo).map((key) => {
            return (
              <tr key={key}>
                <th>{key}:</th>
                <td>{appInfo[key]}</td>
              </tr>
            );
          })}
        </table>
      </div>
      <div className="footer">
        <span className="copy">&copy;{currentYear} Overseer</span>
        <span className="spacer"></span>
        <span className="license">
          <span>Overseer is open source software released under the</span>{' '}
          <Link className="link" href="https://en.wikipedia.org/wiki/GNU_Affero_General_Public_License" target="_blank">
            GNU Affero General Public License v3.0
          </Link>
        </span>
      </div>
    </form>
  );
};
