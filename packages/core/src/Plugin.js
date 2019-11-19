import invariant from "invariant";
import { isPlainObject } from "./utils";
import { runInThisContext } from "vm";
import handleAction from "./middlewares/handleAction";

const hooks = ["onAction", "onReducer", "onEffect", "_handleActions"];

export function filterHooks(obj) {
  return Object.keys(obj).reduce((memo, key) => {
    if (hooks.indexOf(key) > -1) {
      memo[key] = obj[key];
    }
    return memo;
  }, {});
}

class Hook {
  constructor() {
    this.fns = [];
    this.add = this.add.bind(this);
    this.apply = this.apply.bind(this);
    this.applyForEach = this.applyForEach.bind(this);
  }
  add(fn) {
    this.fns.push(fn);
  }
  apply(...args) {
    return this.fns[0](...args);
  }
  applyForEach(...args) {
    this.fns.forEach(fn => fn(...args));
  }

  // applyCompose(fns) {
  //   return (...args) => {
  //     return fns.reduce((prev, current) => {
  //       return prev(current);
  //     }, args);
  //   };
  // }
}

/**
 * @class Plugin
 * @param {*} api registerModel, middlewares
 * @memberof Plugin
 */
export default class Plugin {
  constructor(api, options = {}) {
    this.use = this.use.bind(this);
    this.api = api;
    this.api.hooks = hooks.reduce((memo, key) => {
      memo[key] = new Hook();
      return memo;
    }, {});
    this.api.registerMiddleware = this.registerMiddleware.bind(this);
    this.api.middlewares = {
      total: options.middlewares || [],
      reducer: [],
      effect: [],
      action: [handleAction]
    };
  }

  registerMiddleware = (key, middleware) => {
    this.api.middlewares[key].push(middleware);
  };

  use(createPlugin) {
    const hooksObj = createPlugin(this.api);

    if (hooksObj) {
      invariant(
        isPlainObject(plugin),
        "plugin.use: plugin must return plain object or undefined"
      );
      Object.keys(hooksObj).forEach(key => {
        this.api.hooks[key].add(hooksObj[key]);
      });
    }
  }

  apply(key, defaultHandler) {
    const { hooks } = this;
    const validApplyHooks = ["onError", "onHmr"];
    invariant(
      validApplyHooks.indexOf(key) > -1,
      `plugin.apply: hook ${key} cannot be applied`
    );
    const fns = hooks[key];

    return (...args) => {
      if (fns.length) {
        for (const fn of fns) {
          fn(...args);
        }
      } else if (defaultHandler) {
        defaultHandler(...args);
      }
    };
  }

  get(key) {
    const { hooks } = this;
    invariant(key in hooks, `plugin.get: hook ${key} cannot be got`);
    return hooks[key];
  }

  modifyForEach(fns) {
    return obj => {
      fns.forEach(fn => {
        obj = fn(obj);
      });
      return obj;
    };
  }
}

function _compose(...funcs) {
  if (funcs.length === 1) {
    return funcs[0];
  }
  const last = funcs.pop();
  return funcs.reduce((a, b) => () => b(a), last);
}

export function compose(item, { initialValue }) {
  return () => {
    return _compose(...item, initialValue)();
  };
}
