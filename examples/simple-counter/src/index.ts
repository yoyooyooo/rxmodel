import createApp, { state$$ } from '@rxmodel/core';
import devtools from '@rxmodel/devtools';
import loading from '@rxmodel/loading';
import immer from '@rxmodel/immer';
import { fromEvent } from 'rxjs';
import { delay, mapTo } from 'rxjs/operators';

console.log(immer);

const app = createApp({
  extraEffectOperator: {
    test() {
      console.log('test');
    },
  },
});
app.use(immer());
app.use(devtools());
app.use(loading());
app.model({
  namespace: 'count',
  state: {
    n: 0,
  },
  reducers: {
    add(state, action) {
      state.n++;
    },
    minus(state, action) {
      state.n--;
    },
  },
  effects: {
    addAsync(action$) {
      return action$.pipe(
        delay(1000),
        mapTo({ type: 'add' })
      );
    },
  },
});
app.start();

state$$.subscribe(state => {
  document.querySelector('#result').innerHTML = state.count.n;
  document.querySelector('#loading').innerHTML = `${state.loading.global}`;
});

fromEvent(document.querySelector('#add'), 'click').subscribe(() => {
  app.store.dispatch({ type: 'count/add' });
});

fromEvent(document.querySelector('#minus'), 'click').subscribe(() => {
  app.store.dispatch({ type: 'count/minus' });
});

fromEvent(document.querySelector('#addAsync'), 'click').subscribe(() => {
  app.store.dispatch({ type: 'count/addAsync', $loading: { refCount: true } });
});
