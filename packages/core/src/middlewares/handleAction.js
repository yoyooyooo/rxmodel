import invariant from "invariant";
import { map, tap, mergeMap, delay, switchMap, filter } from "rxjs/operators";
import { of } from "rxjs";
import getActionType from "../getActionType";

export default ({ app }) => next => action$ => {
  return action$.pipe(
    filter(Boolean),
    tap(action => {
      invariant(
        action.type,
        `dispatch: action should be a plain Object with type`
      );
    }),
    map(a => {
      const namespace = a.type.split("/")[0];
      return {
        ...a,
        __type: getActionType(app._models, a, namespace),
        __namespace: namespace,
        __model: app._models.find(m => m.namespace === namespace)
      };
    }),
    next()
  );
};
