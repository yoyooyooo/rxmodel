import isPlainObject from 'is-plain-object';
export { isPlainObject };
export const isArray = Array.isArray.bind(Array);
export const isFunction = o => typeof o === 'function';
export const returnSelf = m => m;
export const noop = () => {};
export const findIndex = (array, predicate) => {
  for (let i = 0, { length } = array; i < length; i += 1) {
    if (predicate(array[i], i)) return i;
  }

  return -1;
};

export function isEffect(type, models) {
  if (!type || typeof type !== 'string') return false;
  const [namespace] = type.split('/');
  const model = models.filter(m => m.namespace === namespace)[0];
  if (model) {
    if (model.effects && model.effects[type]) {
      return true;
    }
  }
  return false;
}

export function reducerOrEffect(type, models) {
  if (!type || typeof type !== 'string') return false;
  const [namespace] = type.split('/');
  const model = models.filter(m => m.namespace === namespace)[0];
  if (model) {
    if (model.reducers && model.reducers[type]) {
      return 'reducer';
    }
    if (model.effects && model.effects[type]) {
      return 'effect';
    }
  }
  return null;
}
