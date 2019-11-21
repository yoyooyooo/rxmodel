import { merge } from 'rxjs';
import { filter, take, withLatestFrom } from 'rxjs/operators';
import { Api } from '@rxmodel/core';

export default () => (api: Api) => {
  if (!(window as any).__REDUX_DEVTOOLS_EXTENSION__) {
    console.warn(
      'You can install Redux DevTools Extension to debug in development.\r\n' +
        'To see more infomation about DevTools: https://github.com/zalmoxisus/redux-devtools-extension/'
    );
    return;
  }
  const devTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__.connect();
  const { state$$, action$$, effect$$, unknown$$ } = api.store;
  state$$.pipe(filter(Boolean), take(1)).subscribe(v => {
    devTools.init(state$$.value);
  });

  // not reducer
  merge(unknown$$, effect$$)
    .pipe(withLatestFrom(state$$))
    .subscribe(([action, state]) => {
      devTools.send(action, state);
    });

  //reducer
  state$$.pipe(withLatestFrom(action$$)).subscribe(([action, state]) => {
    devTools.send(state, action);
  });
};
