
const createStore = (reducer, _state, enhancer) => {
  let state = _state ?? '';

  if (enhancer) {
    return enhancer(createStore)(reducer, state);
  }
  let listener = [];
  const dispatch = (action) => {
    const newState = reducer(state, action);
    state = newState;
    listener.forEach(listen => listen(newState));
  };
  const subscribe = fn => {
    if (listener.indexOf(fn) === -1) listener.push(fn);
    return () => listener = listener.filter(i => i !== fn);
  };
  return {
    getState: () => state,
    subscribe,
    dispatch
  };
};

const applyMiddleware = (...middlewares) => (createStore) => (reducer, state) => {
  const store = createStore(reducer, state);
  let dispatch = undefined;
  const midApi = {
    getState: store.getState,
    dispatch: (...rs) => {
      return dispatch(...rs)
    },
  }
  // 每一个中间件都接收 getState 和 dispatch 方法
  const middlewareChain = middlewares.map((mid) => mid(midApi));
  // 将中间件组合成一个函数进行调用
  dispatch = compose(middlewareChain)(store.dispatch);

  return Object.assign(store, {
    dispatch,
  });
};

var compose = (mid) => {
  // 如果没有中间件，直接返回参数(dispatch)
  if (mid.length === 0) return args => args
  // 如果只有一个中间件，则直接返回
  if (mid.length === 1) return mid[0]
  // 将中间件聚合成 (...arg) => f1(f2(f3(...args)) 形式并返回
  return mid.reduce((l, r) => (...args) => l(r(...args)));
}

export {
  createStore,
  applyMiddleware,
};
