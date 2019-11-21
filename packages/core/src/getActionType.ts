import { Model, AnyAction } from './types';

export default (models: Model[], action: AnyAction, namespace: string) => {
  if (typeof namespace === 'undefined') {
    namespace = action.type.split('/')[0];
  }

  const model = models.find(a => namespace === a.namespace);
  let type: 'unknown' | 'reducer' | 'effect' | 'subscription';
  if (!model) {
    type = 'unknown';
  } else {
    if (Object.keys(model.reducers || {}).some(key => key === action.type)) {
      type = 'reducer';
    }
    if (Object.keys(model.effects || {}).some(key => key === action.type)) {
      type = 'effect';
    }
    if (Object.keys(model.subscriptions || {}).some(key => key === action.type)) {
      type = 'subscription';
    }
  }

  return type;
};
