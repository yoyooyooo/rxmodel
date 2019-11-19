## 使用

```js
app.use(loading());
```

## config

```
loading({
  refCount?: boolean
})
```

### refCount

默认 false，是否计数当前进行中的 effect，例子：连续触发同一个有 1 秒延迟的 effect，1 秒后，loading 会一下 false 一下 true，页面上以此 loading 写的加载图标可能会一下有一下无，因为每个 effect 结尾都会使 loading 变为 false。
对当前 effect 计数后，只会在只剩一个 effect 的时候变为 false。

### action 约定

有时候不希望全局都计数 effect，只想单个 action 计数，此时可以在 action 里加个属性 `$loading: { refCount: true }` （约定所有插件给 action 添加的额外属性都以\$开头）
