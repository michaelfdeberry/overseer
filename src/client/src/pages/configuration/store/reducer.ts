import { AnyAction } from 'redux';

import { ConfigurationState, initialState } from './state';

export default function(state: ConfigurationState = initialState, action: AnyAction) {
    switch (action.type) {
        default:
            return state;
    }
}
