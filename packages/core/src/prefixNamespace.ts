import * as invariant from 'invariant';
import { Model } from './types';

function prefix(obj: any, namespace: string, type: string) {
  return Object.keys(obj).reduce((memo, key) => {
    invariant(
      key.indexOf(`${namespace}/`) !== 0,
      `[prefixNamespace]: ${type} ${key} should not be prefixed with namespace ${namespace}`
    );
    const newKey = `${namespace}/${key}`;
    memo[newKey] = obj[key];
    return memo;
  }, {});
}

export default function prefixNamespace(model: Model) {
  const { namespace, reducers, effects } = model;
  if (reducers) {
    model.reducers = prefix(reducers, namespace, 'reducer');
  }
  if (effects) {
    model.effects = prefix(effects, namespace, 'effect');
  }
  return model;
}
