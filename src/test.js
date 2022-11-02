import { createStore, applyMiddleware } from "./index";
import thunk from './redux-thunk';
import xrxpromise from './redux-xrx-promise';

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

const reducer = (state, action) => {
  switch(action.type) {
    case 'ADD':
      return state + action.payload;
    default:
      return state;
  }
}

const store = createStore(reducer, 0, applyMiddleware(xrxpromise, thunk));

store.subscribe(state => {
  console.log(state);
});

store.dispatch({
  type: 'ADD',
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