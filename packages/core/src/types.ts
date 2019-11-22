import { UnaryFunction, OperatorFunction, Observable, Subject, BehaviorSubject } from 'rxjs';
import Plugin, { Api } from './Plugin';

export interface Options {
  extraEffectOperator?: { [k in string]: any };
  plugins?: any[];
  middlewares?: {
    total?: any[];
    reducer?: any[];
    effect?: any[];
    action?: any[];
  };
}

export interface Store {
  state$$: BehaviorSubject<any>;
  action$$: Subject<AnyAction>;
  reducer$$: Subject<AnyAction>;
  effect$$: Subject<AnyAction>;
  unknown$$: Subject<AnyAction>;
  dispatch: (action: AnyAction) => void;
}

export interface Action<T = any> {
  type: T;
}

export interface AnyAction extends Action {
  [extraProps: string]: any;
}

export type Reducer<S = any, A extends Action = AnyAction> = (state: S | undefined, action: A) => S;

export type Effect = (
  action$: Observable<AnyAction>,
  store?: Store,
  extraEffectOperator?: any
) => Observable<AnyAction | undefined>;
export type Subscription = (store: Store) => void;

export interface Model {
  namespace: string;
  state: any;
  reducers?: Record<string, Reducer>;
  effects?: Record<string, Effect>;
  subscriptions?: Record<string, Subscription>;
}

export interface App {
  _initialState: Record<string, any>;
  _models: Model[];
  _reducers: Record<string, Reducer>;
  _plugin: Plugin;
  model: (m: Model) => Model;
  start: () => App;
  use: (createPlugin: (api: Api) => void | any) => void;
  store: Store;
}
