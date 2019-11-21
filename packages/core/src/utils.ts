import isPlainObject from 'is-plain-object';
import { Model } from './types';

export { isPlainObject };
export const isArray = Array.isArray.bind(Array);
export const isFunction = (o: any) => typeof o === 'function';
export const returnSelf = <S, A>(s: S, a: A) => s as S;
export const noop = () => {};

export function isEffect(type: string, models: Model[]) {
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

export function reducerOrEffect(type: string, models: Model[]) {
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
