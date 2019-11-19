1. 注册 effect 自定义操作符，传给 effect 第二个参数，比如发请求，自带重试、取消和捕获错误

2. 触发一个 effect，结束先触发 loading 插件的渲染（useSelector 订阅改 effect 的 loading），之后立马触发 effect 返回的 reducer，reducer 不消耗多少时间，又触发了一次渲染（useSelector 订阅了这个 reducer 修改的值），能不能优化？允不允许优化？优化了会不会印发其他问题？

3. 检测重名

```js
invariant(``, `[pipes] duplicated type ${type} in pipes and reducers`);
```
