import React, {useEffect, useRef, useState} from 'react';
import {POST} from "../../../api/api";
import {Modal} from 'react-bootstrap';
import LoadingModal from "../../loading_modal/LoadingModal"
import styles from "./LarvaNFTReveal.module.scss"
import backgroundImg from "../../../assets/images/body_bg.jpg";
import titleImg from "../../../assets/images/title1.png";
import Caver from "caver-js";

function LarvaNFTReveal(props) {
    const [showLoading, setShowLoading] = useState(false); // 로딩 모달

    const [showAlertModal, setShowAlertModal] = useState(false);
    const [showMintModal, setShowMintModal] = useState(false);
    const [alerts, setAlerts] = useState("");

    const [disable, setDisable] = useState(true);

    const tokenIdInput = useRef();
    const [tokenId, setTokenId] = useState("");

    useEffect(() => {

    }, [props.accounts]);


    async function nftMintCount() {
        try {
            const result = await POST(`/api/v1/special/mycount`, '', props.apiToken);
            if (result.result === 'success') {

            } else {
                console.log(result.error);
            }
        } catch (e) {
            // alert('조회 실패');
            console.log(e);
        }
    }

    async function approveWallet() {

    }

    const numberCheck = (e) => {
        const regex = /^[0-9\b -]{0,13}$/;
        if (regex.test(e.target.value)) {
            setTokenId(e.target.value);
        }
    }

    async function nftMint() {
        setShowLoading(true);
        try {
            const mintResult = await POST(`/api/v1/special/mint`, '', props.apiToken);
            if (mintResult.result === 'success') {
                // 성공시
                setAlerts(`Token ID ${mintResult.data} Mint Success`);
                setShowAlertModal(true);
            } else {
                // 실패시
                if (mintResult.error !== {}) {
                    setAlerts(mintResult.error['_message']);
                } else {
                    setAlerts("Mint Fail ");
                }
                setShowAlertModal(true);
            }
        } catch (e) {
            setAlerts("Mint Fail ");
            setShowAlertModal(true);
        }
        setShowMintModal(false);
        setShowLoading(false);
    }

    return (
        <>
            <section className={styles.reveal_nft}
                     style={{background: `url(${backgroundImg}) no-repeat center center fixed`}}>
                <div className={styles.content_box}>
                    <div>
                        <img src={titleImg}/>
                    </div>
                    {props.accounts && props.accounts.length > 0 && props.isConnected === 'YES' ? (
                        <button onClick={() => approveWallet()} className={styles.reveal_btn}>APPROVE!</button>
                    ) : (
                        <button onClick={() => props.handleKaikasConnect()}
                                className={styles.reveal_btn}>APPROVE!</button>
                    )
                    }

                    <form>
                        <div className={styles.input_box}>
                            <label>Number</label>
                            <input ref={tokenIdInput} type="text" name="tokenId" value={tokenId} maxLength="4"
                                   onChange={numberCheck}/>
                        </div>
                    </form>
                </div>
            </section>
            {/*알림창 모달*/}
            <Modal centered size="xs" show={showAlertModal}
                   onHide={() => setShowAlertModal(false)}>
                <Modal.Body>
                    <div className="text-center mt-5">
                        <p className={styles.alert_msg}> {alerts}</p>
                    </div>
                </Modal.Body>
                <Modal.Footer className={styles.alert_box}>
                    <button variant="" onClick={() => setShowAlertModal(false)} className={styles.alert_btn}
                            size="lg"
                            block>
                        Close
                    </button>
                </Modal.Footer>
            </Modal>
            {/*리빌확인 모달*/}
            <Modal centered size="xs" show={showMintModal}
                   onHide={() => setShowMintModal(false)}>
                <Modal.Body>
                    <div className="text-center mt-5">
                        <p className={styles.alert_msg}> 정말 리빌 하시겠습니까 ?</p>
                    </div>
                </Modal.Body>
                <Modal.Footer className={styles.alert_box}>
                    <button onClick={() => nftMint()} className={styles.mint_btn}>
                        Mint
                    </button>
                    <button onClick={() => setShowMintModal(false)} className={styles.alert_btn}>
                        Close
                    </button>
                </Modal.Footer>
            </Modal>
            <LoadingModal showLoading={showLoading} setShowLoading={setShowLoading}/>
        </>
    )
}

export default LarvaNFTReveal
