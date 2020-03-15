import { BuildRestrictionType } from '@overseer/common/models';

import { AppState } from '../../../store';

export const selectRestrictionType = (state: AppState): BuildRestrictionType =>
  state.core.isLocalApp ? BuildRestrictionType.local : BuildRestrictionType.remote;
