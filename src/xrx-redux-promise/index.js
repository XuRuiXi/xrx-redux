export default ({ dispatch }) => (next) => async (action) => {
  // 判断action.payload是否为Promise实例
  if (action.payload instanceof Promise) {
    const res = await action.payload;
    dispatch({
      type: action.type,
      payload: res
    });
  } else {
    return next(action);
  }
};
