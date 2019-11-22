import * as invariant from 'invariant';
import {
  BehaviorSubject,
  EMPTY,
  isObservable,
  Observable,
  of,
  OperatorFunction,
  pipe,
  Subject,
} from 'rxjs';
import { catchError, filter, map, mergeMap, scan, tap } from 'rxjs/operators';
import applyMiddleware from './applyMiddleware';
import { AnyAction, Model, Store, App, Options, Reducer } from './types';
import Plugin from './Plugin';

interface Ctx {
  app?: App;
  plugin?: Plugin;
  options?: Options;
}

export const state$$ = new BehaviorSubject<any>(null);
export const unknown$$ = new Subject<AnyAction>();
export const reducer$$ = new Subject<AnyAction>();
export const effect$$ = new Subject<AnyAction>();
export const action$$ = new Subject<AnyAction>();
export const emit$$ = new Subject<(state: any) => any>();

action$$.pipe(
  tap(a => {
    invariant(a && a.type, `dispatch: action should be a plain Object with type`);
  })
);

export function dispatch(action: AnyAction) {
  action$$.next(action);
}

export const store: Store = {
  state$$,
  action$$,
  reducer$$,
  effect$$,
  unknown$$,
  emit$$,
  dispatch: (action: AnyAction) => {
    if (action.type.startsWith('@@')) {
      action.type = action.type.slice(2);
    }
    dispatch(action);
  },
};

function handleReducer({ app }: Ctx) {
  return pipe(
    map<AnyAction, (state: any) => any>(action => {
      const reducers = app._reducers;
      const namespace = action.__namespace;
      if (reducers[namespace]) {
        return state => ({
          ...state,
          [namespace]: reducers[namespace](state[namespace], action),
        });
      } else {
        return state => state;
      }
    })
  );
}

const prefixNamespace = (action: AnyAction, namespace: string) => {
  if (!action.type.includes('/')) {
    action.type = namespace + '/' + action.type;
  }
  return action;
};
const _dispatch = (namespace: string) => (action: AnyAction) => {
  dispatch(prefixNamespace(action, namespace));
};
const handleEffect = ({ options }: Ctx) => {
  return pipe(
    mergeMap<AnyAction, Observable<AnyAction>>(prevAction => {
      const effect = prevAction.__model.effects[prevAction.type];
      const effectToReducer: OperatorFunction<AnyAction, AnyAction> = action$ => {
        const returnObservable$ = effect(
          action$,
          {
            ...store,
            dispatch: _dispatch(prevAction.__namespace),
          },
          { ...(options.extraEffectOperator || {}) }
        );
        invariant(
          isObservable(returnObservable$),
          `[model.effects] effect must return Observable, but got ${typeof returnObservable$}`
        );
        return returnObservable$;
      };
      const newAction = { ...prevAction } as AnyAction;
      Reflect.deleteProperty(newAction, '__type');
      Reflect.deleteProperty(newAction, '__namespace');
      Reflect.deleteProperty(newAction, '__model');
      return of(newAction).pipe(
        effectToReducer,
        filter(action => action && action.type),
        map(action => prefixNamespace(action, prevAction.__namespace)),
        tap(newAction => {
          invariant(
            prevAction.type !== newAction.type,
            `[model.effects] effect should not return self`
          );
        })
      );
    })
  );
};

const handleAction = ({ app, plugin, options }: Ctx) => {
  return pipe(
    applyMiddleware<AnyAction, AnyAction>(plugin.api.middlewares.action, { app }),
    mergeMap(action => {
      if (action.__type === 'effect') {
        return of(action).pipe(
          tap(action => effect$$.next(action)),
          applyMiddleware(plugin.api.middlewares.effect, store, () => handleEffect({ options })),
          tap(action => action$$.next(action))
        );
      } else if (action.__type === 'reducer') {
        return of(action).pipe(
          tap(action => reducer$$.next(action)),
          applyMiddleware(plugin.api.middlewares.reducer, store, () => handleReducer({ app })),
          tap(reducer => emit$$.next(reducer))
        );
      } else {
        return of(action).pipe(tap(action => unknown$$.next(action)));
      }
    })
  );
};

export function createModelStream(model: Model) {
  Object.keys(model.subscriptions || {}).forEach(key => {
    model.subscriptions[key](store);
  });
}

export default function connectRxjs({ app, plugin, options }: Ctx) {
  state$$.next(app._initialState);
  emit$$.pipe(scan((state, reducer) => reducer(state), app._initialState)).subscribe(state$$);
  action$$
    .pipe(
      applyMiddleware(plugin.api.middlewares.total, store, () =>
        handleAction({ app, plugin, options })
      ),
      catchError(err => {
        console.error(`[error]`, err);
        return EMPTY;
      })
    )
    .subscribe();
}
