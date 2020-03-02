import { Action } from 'redux';

export enum CommonActions {
    logout = '@overseer/common/logout'
}

export function logout(): Action {
    return { type: CommonActions.logout };
}
