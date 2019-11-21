import * as invariant from 'invariant';
import { isArray, isFunction, isPlainObject } from './utils';
import { Model } from './types';

export default function checkModel(model: Model, existModels: Model[]) {
  const { namespace, reducers, effects, subscriptions } = model;

  invariant(namespace, `[app.model] namespace should be defined`);
  invariant(
    typeof namespace === 'string',
    `[app.model] namespace should be string, but got ${typeof namespace}`
  );
  invariant(
    !existModels.some(model => model.namespace === namespace),
    `[app.model] namespace should be unique`
  );

  if (reducers) {
    invariant(
      isPlainObject(reducers) || isArray(reducers),
      `[app.model] reducers should be plain object or array, but got ${typeof reducers}`
    );
    invariant(
      !isArray(reducers) || (isPlainObject(reducers[0]) && isFunction(reducers[1])),
      `[app.model] reducers with array should be [Object, Function]`
    );
  }

  if (effects) {
    invariant(
      isPlainObject(effects),
      `[app.model] effects should be plain object, but got ${typeof effects}`
    );
  }

  if (subscriptions) {
    invariant(
      isPlainObject(subscriptions),
      `[app.model] subscriptions should be plain object, but got ${typeof subscriptions}`
    );

    invariant(isAllFunction(subscriptions), `[app.model] subscription should be function`);
  }
}

function isAllFunction(obj) {
  return Object.keys(obj).every(key => isFunction(obj[key]));
}
