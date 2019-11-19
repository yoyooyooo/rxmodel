import { tap } from "rxjs/operators";

export default (config = {}) => api => {
  api.registerModel({
    namespace: "loading",
    state: {
      global: false,
      models: {},
      effects: {}
    },
    reducers: {
      show(state, { namespace, actionType }) {
        return {
          ...state,
          global: true,
          models: { ...state.models, [namespace]: true },
          effects: { ...state.effects, [actionType]: true }
        };
      },
      hide(state, { namespace, actionType }) {
        const effects = {
          ...state.effects,
          [actionType]: false
        };
        const models = {
          ...state.models,
          [namespace]: Object.keys(effects).some(actionType => {
            const _namespace = actionType.split("/")[0];
            if (_namespace !== namespace) return false;
            return !!effects[actionType];
          })
        };
        const global = Object.keys(models).some(namespace => {
          return models[namespace];
        });
        return { ...state, global, models, effects };
      }
    }
  });

  let prevAction;
  let counts = {};
  api.registerMiddleware("effect", store => next => action$ => {
    return action$.pipe(
      tap(action => {
        counts[action.type] = (counts[action.type] || 0) + 1;
        const [namespace, actionType] = action.type.split("/");
        store.dispatch({
          type: "loading/show",
          namespace,
          actionType: action.type
        });
        prevAction = action;
      }),
      next(),
      tap(action => {
        const actionRefCount =
          prevAction.$loading && prevAction.$loading.refCount;
        const refCount =
          actionRefCount !== undefined ? actionRefCount : config.refCount;
        if (!refCount || (refCount && counts[prevAction.type] === 1)) {
          const [namespace, actionType] = prevAction.type.split("/");
          store.dispatch({
            type: "loading/hide",
            namespace,
            actionType: prevAction.type
          });
        }
        counts[prevAction.type] = counts[prevAction.type] - 1;
      })
    );
  });
};
