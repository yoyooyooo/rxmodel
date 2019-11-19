import { isObservable, pipe } from "rxjs";
import invariant from "invariant";

const returnSelf = v => v;

function handleAction(actionType, reducer = returnSelf) {
  return (state, action) => {
    const { type } = action;
    invariant(type, "dispatch: action should be a plain Object with type");
    if (actionType === type) {
      return reducer(state, action);
    }
    return state;
  };
}

function combineReducers(reducers) {
  return (state, currentAction) =>
    reducers.reduce((state, reducer) => reducer(state, currentAction), state);
}

/**
 * @param {*} handlers  model.reducers
 * @param {*} defaultState model.state
 * @returns reducer
 */
export function defaultHandleActions(handlers = {}, defaultState) {
  const reducers = Object.keys(handlers).map(type =>
    handleAction(type, handlers[type])
  );
  const reducer = combineReducers(reducers);
  return (state = defaultState, action) => reducer(state, action);
}

export default function getReducer(
  reducers,
  state,
  handleActions = defaultHandleActions
) {
  if (Array.isArray(reducers)) {
    return reducers[1](handleActions(reducers[0], state));
  } else {
    return handleActions(reducers || {}, state);
  }
}
