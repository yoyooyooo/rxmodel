import * as invariant from 'invariant';
import { isPlainObject } from './utils';
import handleAction from './middlewares/handleAction';
import { Store, Model, AnyAction, Options } from './types';
import { Middleware } from './applyMiddleware';

type hooks = 'onAction' | 'onReducer' | 'onEffect' | '_handleActions';
const hooks = ['onAction', 'onReducer', 'onEffect', '_handleActions'];

export function filterHooks(obj: any) {
  return Object.keys(obj).reduce((memo, key) => {
    if (hooks.indexOf(key) > -1) {
      memo[key] = obj[key];
    }
    return memo;
  }, {});
}

class Hook {
  fns: any[];
  constructor() {
    this.fns = [];
  }
  add = (fn: (...args: any[]) => void | any) => {
    this.fns.push(fn);
  };
  apply = (...args: any[]) => {
    return this.fns[0](...args);
  };
  applyForEach = (...args: any[]) => {
    this.fns.forEach(fn => fn(...args));
  };

  // applyCompose(fns) {
  //   return (...args) => {
  //     return fns.reduce((prev, current) => {
  //       return prev(current);
  //     }, args);
  //   };
  // }
}

type middlewareTypes = 'total' | 'action' | 'reducer' | 'effect';

export interface Api {
  registerModel: (m: Model) => Model;
  registerMiddleware: <T = middlewareTypes>(
    type: T,
    middleware: Middleware<AnyAction, T extends 'action' ? AnyAction : any>
  ) => void;
  store: Store;
  hooks: {
    [k in hooks]: Hook;
  };
  middlewares: {
    total: Middleware<AnyAction, any>[];
    reducer: Middleware<AnyAction, any>[];
    effect: Middleware<AnyAction, any>[];
    action: Middleware<AnyAction, AnyAction>[];
  };
}
export default class Plugin {
  api: Api;
  constructor(api: any, options: Options) {
    const { middlewares = {} } = options;
    this.api = api;
    this.api.hooks = hooks.reduce((memo, key) => {
      memo[key] = new Hook();
      return memo;
    }, {}) as { [k in hooks]: Hook };
    this.api.registerMiddleware = this.registerMiddleware.bind(this);
    this.api.middlewares = {
      total: middlewares.total || [],
      reducer: middlewares.reducer || [],
      effect: middlewares.effect || [],
      action: [handleAction, ...(middlewares.effect || [])],
    };
  }

  registerMiddleware = <I, O>(key: string, middleware: Middleware<I, O>) => {
    this.api.middlewares[key].push(middleware);
  };

  use = (createPlugin: (api: Api) => void | any) => {
    const hooksObj = createPlugin(this.api);

    if (hooksObj) {
      invariant(
        isPlainObject(hooksObj),
        'plugin.use: plugin must return plain object or undefined'
      );
      Object.keys(hooksObj).forEach(key => {
        this.api.hooks[key].add(hooksObj[key]);
      });
    }
  };

  modifyForEach = (fns: any[]) => {
    return (obj: any) => {
      fns.forEach(fn => {
        obj = fn(obj);
      });
      return obj;
    };
  };
}

function _compose(...funcs: any[]) {
  if (funcs.length === 1) {
    return funcs[0];
  }
  const last = funcs.pop();
  return funcs.reduce((a, b) => () => b(a), last);
}

export function compose(items: any[], { initialValue }) {
  return () => {
    return _compose(...items, initialValue)();
  };
}
