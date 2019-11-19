import warning from 'warning';
import { isArray } from './utils';

function prefix(obj, namespace, type) {
  return Object.keys(obj).reduce((memo, key) => {
    warning(
      key.indexOf(`${namespace}/`) !== 0,
      `[prefixNamespace]: ${type} ${key} should not be prefixed with namespace ${namespace}`,
    );
    const newKey = `${namespace}/${key}`;
    memo[newKey] = obj[key];
    return memo;
  }, {});
}

export default function prefixNamespace(model) {
  const { namespace, reducers, effects } = model;
  if (reducers) {
    model.reducers = prefix(reducers, namespace, 'reducer');
  }
  if (effects) {
    model.effects = prefix(effects, namespace, 'effect');
  }
  return model;
}
