import { createStore } from 'redux';
import { allReducers } from './reducers/index';
import { loadState } from './localStorage'

const persistedState = loadState();

export const store = createStore(
	allReducers,
	persistedState,
	window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
 );
