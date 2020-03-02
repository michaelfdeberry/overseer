import { AnyAction } from 'redux';

import { CommonState, initialState } from './state';

export default function CommonReducer(state: CommonState = initialState, action: AnyAction) {
    switch (action.type) {
        default:
            return state;
    }
}
