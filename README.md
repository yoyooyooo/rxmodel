# rxmodel

基于 rxjs 的状态管理

## 安装

```
npm install @rxmodel/core rxjs
yarn add @rxmodel/core rxjs
```

## 快速上手

```js
import createApp, { state$$ } from '@rxmodel/core';

const app = createApp();
app.model({
  namespace: 'count',
  state: {
    n: 0,
  },
  reducers: {
    add(state, action) {
      return { ...state, n: state.n + 1 };
    },
    minus(state, action) {
      return { ...state, n: state.n - 1 };
    },
  },
  effects: {
    addAsync(action$) {
      return action$.pipe(delay(1000), mapTo({ type: 'add' }));
    },
  },
});
app.start();

state$$.subscribe(state => {
  console.log(state);
});

store.dispatch({
  type: 'count/add',
});
store.dispatch({
  type: 'count/addAsync',
});
store.dispatch({
  type: 'count/minus',
});
```

## 结合 react

结合 react 很简单，只需要引入 state\$\$在组件里订阅就行了，提供了几个常用的`react hooks`

## useDispatch

其实没处理什么，直接从`@rxmodel/react`里引入 dispatch 也一样，留个坑，统一从 hook 引入，后面想统一处理的时候就方便了

```jsx
import { useDispatch } from '@rxmodel/react';

export default props => {
  const dispatch = useDispatch();
  return 1;
};
```

## useSelector

```jsx
import { useSelector } from '@rxmodel/react';

export default props => {
  const n = useSelector(state => state.count.n);
  return 1;
};
```

## api

```js
const app = createApp({
  extraEffectOperator: {}, // 注入effect第三个参数，可以在这里加常用操作符
  middlewares: {  // 中间件
    total: [...],
    reducer: [...],
    effect: [...]
  }，
  plugins:[] // 初始化插件
});
```

### app.use(createPlugin)

后续注册插件

### app.model(model)

注册 model

## app.start()

创建 rxjs 相关流，在页面初始化之前调用

## 中间件

### 定义中间件

中间件分为 total、reducer、effect，分别拦截全局 action、reducer、effect。对应的上下游分别是：

- total: action => state
- reducer: action => state
- effect: action => action

中间件写法：

```js
// logger.js
export default store => next => action$ => {
  return action$.pipe(
    tap(a => console.log('prev', a)),
    next(),
    tap(a => console.log('next', a))
  );
};
```

next 就是正常的 rxjs 操作符，调用后会执行主体逻辑，比如 reducer 上游是 action，next 后下游就是 state。所以也可以这样用：

```js
// 让所有action延迟一秒
export default store => next => action$ => {
  return action$.pipe(mergeMap(a => of(a).pipe(delay(1000), next())));
};
```

### 注册中间件

```js
import createApp from "@rxmodel/core";
import logger from "./logger";

const app = createApp({
    middlewares: {
        total: [...],
        reducer: [logger()],
        effect: [...]
    }
});
```

## 插件

可以自定义插件，通过初始化或者 app.use 注册

## 插件基本写法

```js
export default config => api => {};
```

## api

| 名称               | 调用                                                        | 描述               |
| ------------------ | ----------------------------------------------------------- | ------------------ |
| registerModel      | func(model)                                                 | 注册额外 model     |
| registerMiddleware | func('total'\|'reducer'\|'effect', middleware)              | 注册额外 中间件    |
| store              | object: { state$$,action$$,reducer$$,effect$$,unknown\$\$,} | 各个阶段的 rxjs 流 |
