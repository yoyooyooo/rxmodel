import createApp, { state$$ } from "@rxmodel/core";
import { fromEvent } from "rxjs";
import { mapTo, delay } from "rxjs/operators";

const app = createApp();

app.model({
  namespace: "count",
  state: {
    n: 0
  },
  reducers: {
    add(state, action) {
      return { ...state, n: state.n + 1 };
    },
    minus(state, action) {
      return { ...state, n: state.n - 1 };
    }
  },
  effects: {
    addAsync(action$) {
      return action$.pipe(delay(1000), mapTo({ type: "add" }));
    }
  }
});
app.start();

state$$.subscribe(state => {
  document.querySelector("#result").innerHTML = state.count.n;
});

fromEvent(document.querySelector("#add"), "click").subscribe(() => {
  app.store.dispatch({ type: "count/add" });
});

fromEvent(document.querySelector("#minus"), "click").subscribe(() => {
  app.store.dispatch({ type: "count/minus" });
});

fromEvent(document.querySelector("#addAsync"), "click").subscribe(() => {
  app.store.dispatch({ type: "count/addAsync" });
});
