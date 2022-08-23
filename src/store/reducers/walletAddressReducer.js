const walletAddressReducer = function (state = [], action) {
  switch (action.type) {
    case "CHANG_ADDRESS":
      return action.payload;
    default:
      return state;
  }
};

export default walletAddressReducer
