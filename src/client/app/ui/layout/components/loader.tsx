import { Theme, useTheme } from '@material-ui/core';
import * as React from 'react';
import LoadingBar from 'react-top-loading-bar';

import { useSelector } from '../../../hooks';

export const Loader: React.FunctionComponent = () => {
  const loading = useSelector(state => state.loading);
  const loadingBarRef = React.useRef<LoadingBar>();
  const theme: Theme = useTheme();

  React.useEffect(() => {
    if (loading && !loadingBarRef.current.props.progress) {
      loadingBarRef.current.continuousStart();
    } else if (!loading) {
      loadingBarRef.current.complete();
    }
  }, [loading])

  return (
    <LoadingBar
      height={3}
      color={theme.palette.primary.main}
      onRef={(ref: LoadingBar) => loadingBarRef.current = ref}
    />
  )
}
