import React from 'react'

import logo from "../../assets/images/logo.png";
import ConnectWallet from "../../components/connect_wallet/ConnectWallet";
import styles from "./Header.module.scss"
function Header(props) {
    return (
        <>
            <div className={styles.header}>
                <img className={styles.logo_img} src={logo} alt="header logo"/>
                {props.accounts && props.accounts.length > 0 && props.isConnected === 'YES' ? (
                    <>
                        <ConnectWallet accounts={props.accounts} apiToken={props.apiToken} isConnected={props.isConnected} networkId={props.networkId}
                                       handleKaikasConnect={() => props.handleKaikasConnect()}
                                       handleLogout={() => props.handleLogout()}/>

                    </>
                ) : (
                    <ConnectWallet accounts={props.accounts} apiToken={props.apiToken} isConnected={props.isConnected} networkId={props.networkId}
                                   handleKaikasConnect={() => props.handleKaikasConnect()}/>
                )
                }
            </div>
        </>
    )
}

export default Header
