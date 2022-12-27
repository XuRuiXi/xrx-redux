import { createStore, applyMiddleware, combineReducers } from "./index";
// import { legacy_createStore as createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'xrx-redux-thunk';
import xrxpromise from 'xrx-redux-promise';
const asyncAdd = () => new Promise((resolve) => {
  setTimeout(() => {
    resolve(3);
  }, 1000);
});

const asyncAdd2 = (n) => new Promise((resolve) => {
  setTimeout(() => {
    resolve(n);
  }, 1000);
});

const reducer = (state = 0, action) => {
  console.log(action);
  switch(action.type) {
    case 'ADD':
      return state + action.payload;
    default:
      return state;
  }
}

const reducer2 = (state = 0, action) => {
  switch(action.type) {
    case 'MINUS':
      return state - action.payload;
    default:
      return state;
  }
}

const reducers = combineReducers({
  reducer,
  reducer2,
})

const store = createStore(reducers, applyMiddleware(xrxpromise, thunk));

store.subscribe(() => {
  console.log(store.getState());
});

store.dispatch({
  type: 'ADD',
  payload: 1,
});


store.dispatch({
  type: 'MINUS',
  payload: 1,
});

store.dispatch((dispatch) => {
  setTimeout(() => {
    dispatch({
      type: 'ADD',
      payload: 2,
    })
  }, 1000)
});

store.dispatch({
  type: 'ADD',
  payload: asyncAdd().then(async res => {
    const re = await asyncAdd2(res);
    return re;
  }),
});
