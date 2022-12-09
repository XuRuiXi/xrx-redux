
const createStore = (reducer, preloadedState, enhancer) => {
  let state;
  // 判断不传初始state的情况
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    state = undefined;;
    enhancer = preloadedState;
  } else {
    state = preloadedState;
  }

  if (enhancer) {
    return enhancer(createStore)(reducer, state);
  }
  let listener = [];
  const dispatch = (action) => {
    const newState = reducer(state, action);
    state = newState;
    listener.forEach(listen => listen());
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

  return {
    ...store,
    dispatch
  };
};

var compose = (mid) => {
  // 如果没有中间件，直接返回参数(dispatch)
  if (mid.length === 0) return args => args
  // 如果只有一个中间件，则直接返回
  if (mid.length === 1) return mid[0]
  // 将中间件聚合成 (...arg) => f1(f2(f3(...args)) 形式并返回
  return mid.reduce((l, r) => (...args) => l(r(...args)));
};


const validateReducers = (reducers) => {
  if (typeof reducers !== 'object') {
    throw new TypeError('reducers 必须是一个对象')
  }

  if (!isPlanObject) {
    throw new TypeError('reducers 必须是一个平面对象')
  }

  // 构造一个随机action，验证reducer返回的不能是undefined
  for (let key in reducers) {
    if (reducers.hasOwnProperty(key)) {
      const reducer = reducers[key];
      let state = reducer(undefined, {
        type: ActionTypes.INIT()
      })
      // null不绝对等于undefined
      if (state === undefined) {
          throw new TypeError("reducers must not return undefined");
      }
      // 再次判断是否返回undefined
      state = reducer(undefined, {
          type: ActionTypes.UNKNOWN()
      })
      if (state === undefined) {
          throw new TypeError("reducers must not return undefined");
      }
    }
  }
}

const isPlanObject = reducers => {
  return Reflect.getPrototypeOf(reducers) !== Object.prototype
}


const getRandomString = length => { 
  return Math.random().toString(36).substr(2, length).split("").join(".")
}


const ActionTypes = {
  INIT() {
    return `@@redux/INIT${getRandomString(6)}`
  },
  UNKNOWN(){
    return `@@redux/PROBE_UNKNOWN_ACTION${getRandomString(6)}`
  }
}

const combineReducers = reducers => {
  validateReducers(reducers);
  return (state = {}, action) => {
    for (let key in reducers) {
      if (reducers.hasOwnProperty(key)) {
        const reducer = reducers[key];
        state[key] = reducer(state[key], action);
      }
    }
    return state;
  }
}

export {
  createStore,
  applyMiddleware,
  combineReducers,
};
