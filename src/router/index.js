import React, { useEffect, useRef, useState} from 'react'
import {BrowserRouter,  Route, Switch} from 'react-router-dom'
import Header from "../containers/header/Header";
import Footer from "../containers/footer/Footer";
import Home from "../components/home/Home";
import {GET, POST} from "../api/api";
import {useWeb3React} from "@web3-react/core";
import { kaikasConnector} from "../utils/web3/connectors";
import Caver from "caver-js";
import {isTestNet} from "../utils/web3/networks";
import {store} from "../store";
import {CHANGE_ADDRESS} from "../store/actions/walletAddress";

function Index() {

    const {account, active, activate, chainId, deactivate} = useWeb3React();
    const didMount = useRef(true);
    const [accounts, setAccounts] = useState([]);
    const [apiToken, setApiToken] = useState(null);
    const [networkId, setNetworkId] = useState(1);
    const [isConnectedWallet, setConnectWallet] = useState(undefined);


    useEffect(() => {
        const isConnected = window.localStorage.getItem("isConnected");
        if (isConnected === 'YES') {
            connectKaikas();
        } else {
            setConnectWallet("NO");
        }
        checkWalletClosed();
    }, []);

    useEffect(async () => { // CHECK CONNECTION
        if (didMount.current) {
            didMount.current = false;
            return;
        }
        if (!active) {
            await logout();
        }
        // 새고로침시 로그아웃 되는 로직개선
        if (account) {
            const storeAddress = store.getState().wallet.address;
            if (storeAddress !== account.toLowerCase()) {
                await logout();
            }
        }
    }, [active, account]);

    async function checkWalletClosed() {
        setInterval(async () => {
            const isConnected = window.localStorage.getItem("isConnected");
            // console.log(isConnected);
            if (isConnected === 'YES') {
                const isUnlocked = await window.klaytn._kaikas.isUnlocked();
                // console.log(isUnlocked);
                if (!isUnlocked) {
                    await logout();
                }
            } else {
                setConnectWallet("NO");
            }
        }, 1000);
    }

    function loadWalletAttributes(account, chainId) {
        setConnectWallet('YES');
        let tempAccounts = [];
        tempAccounts.push(account);
        setAccounts(tempAccounts);
        store.dispatch(CHANGE_ADDRESS(account,chainId));
        setNetworkId(chainId);
        window.localStorage.setItem('isConnected', 'YES');
    }

    async function connectKaikas() {
        if (isKaikasWalletInstalled()) {
            try {
                await activate(kaikasConnector);

                const accounts = await window.klaytn.enable();
                const account = accounts[0]
                if(!isTestNet){
                    if(window.klaytn.networkVersion !== 8217){
                        alert('Please switch your wallet to the mainnet.');
                        throw 'error';
                    }
                }

                const token = localStorage.getItem('aniverse_token');
                if(token === null){
                    //토큰생성
                    const res = await GET(`/api/v1/auth/larva_reveal/${account}/uuid`);
                    // sign
                    const message = res.uuid;
                    const provider = window['klaytn'];
                    const caver = new Caver(provider);
                    //서명받기
                    await caver.klay.sign(message, account).then(async (message)=>{
                        // get JWT
                        // jwt = await requestSignin(address, signedMessage);
                        await POST(`/api/v1/auth/larva_reveal/signin`, {
                            address: account,
                            message
                        }).then((sign) => {
                            localStorage.setItem('aniverse_token',  sign.token);
                            setApiToken(sign.token);
                            loadWalletAttributes(account, window.klaytn.networkVersion);
                        });
                        // save JWT
                    });


                } else if(token){
                    const tokenCheck = await POST(`/api/v1/auth/tokencheck`,{address: account},token);
                    if(tokenCheck.result === 'success' && tokenCheck.address === account){
                        setApiToken(token);
                        loadWalletAttributes(account, window.klaytn.networkVersion);
                    }else {
                        await logout();
                    }
                } else {
                    await logout();
                }
            } catch (e) {
                await logout();
                console.log(e)
            }
        } else {
            alert("Please install Kaikas");
        }
    }


    function isKaikasWalletInstalled() {
        return window.klaytn !== undefined
    }

    async function logout() {
        setConnectWallet("NO");
        window.localStorage.setItem("isConnected", "NO");
        window.localStorage.removeItem("aniverse_token");
        setNetworkId(undefined);
        setAccounts([]);
        try {
            await deactivate();
        } catch (e) {
            console.log(e);
        }
    }

    return (

        <BrowserRouter>
            <Header accounts={accounts} apiToken={apiToken} isConnected={isConnectedWallet} networkId={networkId}
                    handleKaikasConnect={() => connectKaikas()} handleLogout={() => logout()} />
            <Switch>
                <Route exact path="/">
                    <Home accounts={accounts} apiToken={apiToken} isConnected={isConnectedWallet} networkId={networkId}
                          handleKaikasConnect={() => connectKaikas()}
                          handleLogout={() => logout()}/>
                </Route>
            </Switch>
            <Footer/>
        </BrowserRouter>
    )
}

export default Index
