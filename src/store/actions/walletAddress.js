export function CHANGE_ADDRESS(address,chainId) {
  return {
    type: 'CHANG_ADDRESS',
    payload: {
      address,
      chainId
    }
  };
}
