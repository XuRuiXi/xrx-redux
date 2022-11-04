### 实现redux核心功能（createStore, applyMiddleware）
---
#### 开始之前，需要了解几个概念
- **store**
store是通过createStore创建的仓库,主要提供三个方法：
getState：获取state
dispatch：接收action，然后通过reducer处理state
subscribe：注册监听器
- **state**
存储在store里面的数据，只能通过getState获取
- **action**
一个对象，表示一种行为。reducer根据action处理state
- **reducer**
用户定义的用来处理state的函数。规定了固定接收state，action。以及return最新的state
- **dispatch**
接收action，触发reducer

#### createStore初现
createStore接收reducer（必传），初始的state（可选），enhancer（插件，可选），返回一个store
```javascript
function createStore(reducer, state = '', enhancer) {
  ...
  return {
    getState,
    dispatch,
    subcribe
  }
}
```
我们内部需要初始化state，linstener(用来存储监听器的列表)
```javascript
let state = '';
let listener = [];
```
getState方法返回state
```javascript
const getState = () => state;
```

subscribe方法接收函数，注册监听器。并且返回用来销毁监听器的函数
```javascript
const subscribe = (fn) => {
  if (listener.indexOf(fn) === -1) listener.push(fn);
  return () => listener.filter(i => i !== fn);
}
```

dispatch方法接收action，调用reducer，拿到最新state并且更新,当state更新时，触发监听器列表执行
```javascript
const dispatch = (action) => {
  const newState = reducer(state, action);
  state = newState;
  listener.forEach(i => i(newState))
}
```

#### 完整的createStore
```javascript
function createStore(reducer, _state, enhancer) {
  let state = _state ?? '';
  // 这段处理中间件，讲applyMiddleware会涉及
  if (enhancer) return enhancer(createStore)(reducer, state);

  const listener = [];
  const getState = () => state;
  const subscribe = (fn) => {
    if (listener.indexOf(fn) === -1) listener.push(fn);
    return () => listener.filter(i => i !== fn);
  }
  const dispatch = (action) => {
    const newState = reducer(state, action);
    state = newState;
    listener.forEach(i => i(newState))
  }
  return {
    getState,
    dispatch,
    subcribe
  }
}
```
---
#### **applyMiddleware初现**
使用方法：
```javascript
createStore(reducer, _state, applyMiddleware(thunk, saga))
```
applyMiddleware可接收多个中间件函数，通过createStore里面这段函数
```javascript
if (enhancer) return enhancer(createStore)(reducer, state);
```
能知道的有2点：
1.当存在中间件的时候，触发enhancer并且返回其结果。所以applyMiddleware最终返回也是一个store
2.applyMiddleware是一个HOC函数，而且观察可知其执行了3次，才把store return出去
所以：
```javascript
const applyMiddleware = (...middlewares) => {
  return (createStore) => {
    return (reducer, state) => {
      return store;
    }
  }
}
```
上述可知applyMiddleware函数接收了createStore,也接收了reducer和state。
因此我们可以通过这3个参数创建store
```javascript
const store = createStore(reducer, state);
```

重点来了，直接上完整代码
```javascript
const applyMiddleware = (...middlewares) => (createStore) => (reducer, state) => {
  const store = createStore(reducer, state);
  let dispatch = undefined;
  let getState = store.getState;
  const midApi = {
    getState,
    dispatch: (...res) => dispatch(...res),
  };
  const middlewaresChain = middlewares.map(mid => mid(midApi));
  dispatch = compose(...middlewaresChain)(store.dispatch);
}

const compose = (...mids) => {
  if (mids.length === 0) {
    return args => args;
  }
  if (mids.length === 1) {
    return mids[0]
  }
  return mids.reduce((l, r) => (...args) => l(r(...args)));
}

```

首先
我们需要了解，作者把中间件的格式固定好了为：
```javascript
const middleware = ({ dispatch, getState }) => (next) => (action) => {}
```
中间件（middleware）前面的入参(dispatch, getState, next)通过applyMiddleware这个方法，传入了。

```javascript
const midApi = {
  getState,
  dispatch: (...res) => dispatch(...res),
};
const middlewaresChain = middlewares.map(mid => mid(midApi));
```
这里middlewaresChain得到的是执行完之后的中间件插件列表，对应的是每个中间件得到了dispatch、getState。

```javascript
dispatch = compose(...middlewaresChain)(store.dispatch);
```
compose是把插件组合成
```javascript
(...arg) => f1(f2(f3(...arg)))
```
这种形式，从右往左的返回结果作为前一个的入参

compose执行之后的得到的
```javascript
dispatch = (...arg) => f1(f2(f3(...arg)))(store.dispatch)
```
传入store.dispatch执行，结合中间件的格式来看，f1的返回结果是一个函数，缓存了一个next，这个f1的next就是f2的返回也是一个函数，缓存了一个next，这个f2的next就是f3的返回结果，而f3的返回结果也是个函数，缓存了一个next，而store.dispatch就是f3的入参next，最后dispatch就等于f1()的执行结果（函数），接收action。

#### **附件**

附上redux-thunk的实现源码，助于理解redux
```javascript
export default ({ getState, dispatch }) => (next) => (action) => {
  if (typeof action === 'function') {
    return action(dispatch, getState);
  } else {
    return next(action);
  }
};
```

#### **感悟**
redux核心内容精简之后，代码量不多。但几乎每一行都无不体现原作者的代码功力。篇幅原因，代码上有些很不错细节没有描述出来。之后我可能会出个视频讲一讲，先占个位置。

### **视频地址**

### **2022-11-4**