import { combineReducers } from 'redux'
import wallet from './walletAddressReducer'

export const allReducers = combineReducers({
	wallet,
})

export default allReducers;
