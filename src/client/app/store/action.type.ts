export type Action = { type: string };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyAction = Action & { [key: string]: any };

export const arraysAreNotAllowedMsg = 'Arrays are not allowed as typed action';
type ArraysAreNotAllowed = typeof arraysAreNotAllowedMsg;

export const typePropertyIsNotAllowedMsg = 'Properties with the name type are not allowed';
type TypePropertyIsNotAllowed = typeof typePropertyIsNotAllowedMsg;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NotAllowedCheck<T extends object> = T extends any[] ? ArraysAreNotAllowed : T extends { type: any } ? TypePropertyIsNotAllowed : unknown;

export type TypedAction<T extends object> = Action & T & NotAllowedCheck<T>;
