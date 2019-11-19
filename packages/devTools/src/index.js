import {
  filter,
  take,
  withLatestFrom,
  combineLatest,
  tap
} from "rxjs/operators";
import { pipe, merge } from "rxjs";

export default config => api => {
  if (!window.__REDUX_DEVTOOLS_EXTENSION__) {
    console.warn(
      "You can install Redux DevTools Extension to debug in development.\r\n" +
        "To see more infomation about DevTools: https://github.com/zalmoxisus/redux-devtools-extension/"
    );
    return;
  }
  const devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect();
  const { state$$, action$$, reducer$$, effect$$, unkown$$ } = api.store;
  state$$.pipe(filter(Boolean), take(1)).subscribe(v => {
    devTools.init(state$$.value);
  });

  merge(unkown$$, effect$$)
    .pipe(withLatestFrom(state$$))
    .subscribe(([action, state]) => {
      devTools.send(action, state);
    });
  //reducer
  state$$.pipe(withLatestFrom(action$$)).subscribe(([action, state]) => {
    devTools.send(state, action);
  });

  api.registerMiddleware("effect", store => next => action$ => {
    return action$.pipe(
      tap(a => console.log(111111, a)),
      next(),
      tap(a => console.log(222222, a))
    );
  });
};
