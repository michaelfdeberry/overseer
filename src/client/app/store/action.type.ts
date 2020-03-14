import { Action } from 'redux';

export type TypedAction<T> = T & Action<string>;
