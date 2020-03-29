import { Theme, useTheme } from '@material-ui/core';
import * as React from 'react';
import LoadingBar from 'react-top-loading-bar';
import { Subscription, timer } from 'rxjs';

import { useDispatch, useSelector } from '../../../hooks';

export const Loader: React.FunctionComponent = () => {
  const dispatch = useDispatch();
  const theme: Theme = useTheme();
  const cancelRef = React.useRef<Subscription>();
  const loadingBarRef = React.useRef<LoadingBar>();
  const loading = useSelector(state => state.loading);

  const setupCancelTimer = () => {
    cancelRef.current = timer(30000).subscribe(() => {
      if (!cancelRef.current) return;
      loadingBarRef.current.complete();
    });
  };

  React.useEffect(() => {
    if (loading && cancelRef.current) {
      cancelRef.current.unsubscribe();
      setupCancelTimer();
    };

    if (loading && !loadingBarRef.current.props.progress) {
      loadingBarRef.current.continuousStart();
      setupCancelTimer();
    } else if (!loading && loadingBarRef.current) {
      if (cancelRef.current) {
        cancelRef.current.unsubscribe();
        cancelRef.current = undefined;
      }

      loadingBarRef.current.complete();
    }
  }, [loading]);

  return (
    <div className="loader">
      <LoadingBar
        height={3}
        color={theme.palette.primary.main}
        onRef={(ref: LoadingBar) => loadingBarRef.current = ref}
      />
    </div>
  )
}
