import axios from 'axios';
import {showLoader, hideLoader} from '../store/actions/loader';
import {store} from '../store';
import {isTestNet} from "../utils/web3/networks";


export const MAIN_URL = isTestNet ? 'http://localhost:4000' : 'https://api2.aniversenft.com';

const axiosInstance = axios.create({
    baseURL: MAIN_URL
});

export function GET(url, token) {
    return new Promise((resolve, reject) => {
        store.dispatch(showLoader());
        let axiosConfig;
        if(token){
            axiosConfig =  {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            }
        }
        axiosInstance.get(url, axiosConfig)
            .then(response => {
                resolve(response.data);
            }).catch(error => {
            reject(error);
        }).finally(() => {
            store.dispatch(hideLoader());
        });
    });
}

export function POST(url, data, token) {
    return new Promise((resolve, reject) => {
        store.dispatch(showLoader());
        let axiosConfig;
        if(token){
            axiosConfig =  {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            }
        }
        axiosInstance.post(url, data, axiosConfig)
            .then(response => {
                resolve(response.data);
            }).catch(error => {
            reject(error);
        }).finally(() => {
            store.dispatch(hideLoader());
        });
    });
}
