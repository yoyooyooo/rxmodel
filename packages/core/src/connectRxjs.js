import invariant from 'invariant';
import { BehaviorSubject, EMPTY, isObservable, of, pipe, Subject } from 'rxjs';
import { catchError, filter, map, mergeMap, scan, tap } from 'rxjs/operators';
import applyMiddleware from './rxjs/applyMiddleware';

export const state$$ = new BehaviorSubject(null);
export const unkown$$ = new Subject();
export const reducer$$ = new Subject();
export const effect$$ = new Subject();
export const action$$ = new Subject().pipe(
  tap(a => {
    invariant(a && a.type, `dispatch: action should be a plain Object with type`);
  })
);

export function dispatch(action) {
  action$$.next(action);
}

export const store = {
  state$$,
  action$$,
  reducer$$,
  effect$$,
  unkown$$,
  dispatch: action => {
    if (action.type.startsWith('@@')) {
      action.type = action.type.slice(2);
    }
    dispatch(action);
  },
};

function handleReducer({ app, plugin }) {
  return pipe(
    scan((state, action, i) => {
      const reducers = app._reducers;
      const namespace = action.__namespace;
      if (reducers[namespace]) {
        Reflect.deleteProperty(action, '__type');
        Reflect.deleteProperty(action, '__namespace');
        Reflect.deleteProperty(action, '__model');
        return {
          ...state,
          [namespace]: reducers[namespace](state[namespace], action),
        };
      } else {
        return state;
      }
    }, state$$.value)
  );
}

const prefixNamespace = (action, namespace) => {
  if (!action.type.includes('/')) {
    action.type = namespace + '/' + action.type;
  }
  return action;
};
const _dispatch = namespace => action => {
  dispatch(prefixNamespace(action, namespace));
};
function handleEffect({ app, plugin }) {
  return pipe(
    mergeMap(prevAction => {
      const effect = prevAction.__model.effects[prevAction.type];
      const effectToReducer = action$ => {
        const returnObservable$ = effect(action$, {
          ...store,
          dispatch: _dispatch(prevAction.__namespace),
        });
        invariant(
          isObservable(returnObservable$),
          `[model.effects] effect must return Observable, but got ${typeof returnObservable$}`
        );
        return returnObservable$;
      };
      const newAction = { ...prevAction };
      Reflect.deleteProperty(newAction, '__type');
      Reflect.deleteProperty(newAction, '__namespace');
      Reflect.deleteProperty(newAction, '__model');
      return of(newAction).pipe(
        effectToReducer,
        filter(action => action && action.type),
        map(action => prefixNamespace(action, prevAction.__namespace)),
        tap(newAction => {
          invariant(prevAction.type !== newAction.type, `[model.effects] effect should not return self`);
        })
      );
    })
  );
}

function handleAction({ app, plugin }) {
  return action$ =>
    action$.pipe(
      applyMiddleware(plugin.api.middlewares.action, { app }),
      mergeMap(action => {
        if (action.__type === 'effect') {
          return of(action).pipe(
            tap(action => effect$$.next(action)),
            applyMiddleware(plugin.api.middlewares.effect, store, () => handleEffect({ app, plugin, action$ })),
            tap(action => action$$.next(action))
          );
        } else if (action.__type === 'reducer') {
          return of(action).pipe(
            tap(action => reducer$$.next(action)),
            applyMiddleware(plugin.api.middlewares.reducer, store, () => handleReducer({ app, plugin })),
            tap(action => state$$.next(action))
          );
        } else {
          return of(action).pipe(tap(action => unkown$$.next(action)));
        }
      })
    );
}

export function createModelStream(model) {
  Object.keys(model.subscriptions || {}).forEach(key => {
    model.subscriptions[key](store);
  });
}

export default function connectRxjs({ app, plugin, reducers }) {
  state$$.next(app._initialState);
  action$$
    .pipe(
      applyMiddleware(plugin.api.middlewares.total, store, () => handleAction({ app, plugin })),
      catchError(err => {
        console.error(`[error]`, err);
        return EMPTY;
      })
    )
    .subscribe();
}
