import checkModel from './checkModel';
import connectRxjs, { createModelStream, store } from './connectRxjs';
import getReducer from './getReducer';
import Plugin from './Plugin';
import prefixNamespace from './prefixNamespace';

function createApp(options) {
  const plugin = new Plugin({ registerModel: model, store }, options);

  let app = {
    _initialState: {},
    _models: [],
    _reducers: {},
    _plugin: plugin,
    model,
    start,
    use: plugin.use,
    store,
  };
  (options.plugins || []).forEach(p => plugin.use(p));
  return app;

  function model(m) {
    if (process.env.NODE_ENV !== 'production') {
      checkModel(m, app._models);
    }
    const prefixedModel = prefixNamespace({ ...m });
    app._initialState[m.namespace] = m.state;
    app._models.push(prefixedModel);

    const _handleActions = plugin.api.hooks._handleActions;
    const reducer = getReducer(
      prefixedModel.reducers,
      prefixedModel.state,
      _handleActions.fns.length > 0 ? _handleActions.fns[0] : undefined
    );
    app._reducers[m.namespace] = reducer;
    createModelStream(prefixedModel);
    return prefixedModel;
  }

  function start() {
    connectRxjs({ app, plugin, options });
  }
}

export default function init(opts = {}) {
  const app = createApp(opts);
  return app;
}
