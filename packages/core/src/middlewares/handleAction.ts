import * as invariant from 'invariant';
import { filter, map, tap } from 'rxjs/operators';
import getActionType from '../getActionType';
import { AnyAction, Model } from '../types';
import { Middleware } from '../applyMiddleware';

const handleAction: Middleware<
  AnyAction,
  AnyAction & {
    __type: ReturnType<typeof getActionType>;
    __namespace: string;
    __model: Model;
  }
> = ({ app }) => next => action$ => {
  return action$.pipe(
    filter<AnyAction>(Boolean),
    tap(action => {
      invariant(action.type, `dispatch: action should be a plain Object with type`);
    }),
    map(a => {
      const namespace = a.type.split('/')[0];
      return {
        ...a,
        __type: getActionType(app._models, a, namespace),
        __namespace: namespace,
        __model: app._models.find((m: Model) => m.namespace === namespace),
      };
    }),
    next()
  );
};
export default handleAction;
