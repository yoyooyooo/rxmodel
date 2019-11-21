import * as invariant from 'invariant';
import { AnyAction, Reducer } from './types';
import { returnSelf } from './utils';

function handleAction(actionType: string, reducer = returnSelf) {
  return (state: any | undefined, action: AnyAction) => {
    const { type } = action;
    invariant(type, 'dispatch: action should be a plain Object with type');
    if (actionType === type) {
      return reducer(state, action);
    }
    return state;
  };
}

function combineReducers(reducers: Reducer[]) {
  return (state: any | undefined, currentAction: AnyAction) =>
    reducers.reduce((state, reducer) => reducer(state, currentAction), state);
}

export function defaultHandleActions(handlers = {}, defaultState: any | undefined): Reducer {
  const reducers = Object.keys(handlers).map(type => handleAction(type, handlers[type]));
  const reducer = combineReducers(reducers);
  return (state = defaultState, action: AnyAction) => reducer(state, action);
}

export default function getReducer(
  reducers: Record<string, Reducer> | [Record<string, Reducer>, (reducer: Reducer) => Reducer],
  state: any | undefined,
  handleActions = defaultHandleActions
) {
  if (Array.isArray(reducers)) {
    return reducers[1](handleActions(reducers[0], state));
  } else {
    return handleActions(reducers || {}, state);
  }
}
