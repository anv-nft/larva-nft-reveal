import React, {useState,} from 'react'
import styles from "./ConnectWallet.module.scss"
import klayIcon from "../../assets/images/icon/icon_klay.png";
function ConnectWallet(props) {

    const [isKaikasInstalled, setKaikasInstalled] = useState(false);


    function handleKaikas() {

        if (isKaikasWalletInstalled()) {
            props.handleKaikasConnect()
        } else {
            setKaikasInstalled(true);
        }

    }

    function isKaikasWalletInstalled() {
        return window.klaytn !== undefined
    }

    function confirmLogout() {
        if (window.confirm('로그아웃 하시겠습니까 ?')) {
            props.handleLogout()
        }
    }

    return (
        <>
            <div className={styles.button_box}>
                {props.accounts && props.accounts.length > 0 && props.isConnected === 'YES' ? (
                    <button onClick={() => confirmLogout()}
                            className={styles.wallet_button}>{props.accounts}</button>
                ) : (
                    <button onClick={() => handleKaikas()} className={styles.wallet_button}><img src={klayIcon}/>Connect
                        Wallet</button>
                )
                }
            </div>
        </>
    )
}

export default ConnectWallet
