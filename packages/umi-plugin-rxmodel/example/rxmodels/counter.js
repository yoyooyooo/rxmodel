export default {
  state: { n: 0 },
  reducers: {
    add(state, action) {
      return { ...state, n: state.n + 1 };
    },
  },
};
