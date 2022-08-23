import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
/* REDUX AND STORE IT TO LOCALSTORAGE */
import { store } from './store'
// import { Provider }  from 'react-redux'
import { saveState } from './store/localStorage'
import { throttle } from 'lodash';

import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

store.subscribe(throttle(() => {
  saveState(store.getState());
  console.log(store.getState());
}, 1000));
function getLibrary(provider) {
	const library = new Web3Provider(provider, "any");
	return library;
}

ReactDOM.render(
	<Web3ReactProvider getLibrary={getLibrary} store={store}>
		<App />
	</Web3ReactProvider>,
  document.getElementById('root')
);
