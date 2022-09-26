import React, {useEffect, useRef, useState} from 'react';
import {POST} from "../../../api/api";
import {Modal} from 'react-bootstrap';
import LoadingModal from "../../loading_modal/LoadingModal"
import styles from "./LarvaNFTReveal.module.scss"
import backgroundImg from "../../../assets/images/body_bg.jpg";
import titleImg from "../../../assets/images/mv_title_reveal.png";
import {PAUSABLE_NFT} from "../../../utils/abi/PAUSABLE_NFT";
import {REVEAL_ABI} from "../../../utils/abi/REVEAL_ABI";
import {contracts} from "../../../utils/web3/contracts";
import Caver from "caver-js";

function LarvaNFTReveal(props) {
    const [showLoading, setShowLoading] = useState(false); // 로딩 모달

    const [showAlertModal, setShowAlertModal] = useState(false);
    const [showRevealModal, setShowRevealModal] = useState(false);
    const [alerts, setAlerts] = useState("");

    const [approveStatus, setApproveStatus] = useState(false);

    const tokenIdInput = useRef();
    const [tokenId, setTokenId] = useState("");
    const provider = window['klaytn'];
    const caver = new Caver(provider);
    const CURRENT_NFT_CONTRACT_ADDRESS = contracts['current_nft_contract'][props.networkId];
    const REVEAL_CONTRACT_ADDRESS = contracts['reveal_contract'][props.networkId];
    // const REVEAL_NFT_CONTRACT_ADDRESS = contracts['reveal_nft_contract'][props.networkId];
    const currentNftContract = new caver.klay.Contract(PAUSABLE_NFT, CURRENT_NFT_CONTRACT_ADDRESS);
    const revealContract = new caver.klay.Contract(REVEAL_ABI, REVEAL_CONTRACT_ADDRESS);
    // const revealNftContract = new caver.klay.Contract(PAUSABLE_NFT, REVEAL_NFT_CONTRACT_ADDRESS);
    useEffect(() => {
        setApproveStatus(false);
    }, [tokenId]);

    function tokenIdCheck() {
        if (tokenIdInput.current.value === "") {
            setAlerts("Please enter your token ID.");
            setShowAlertModal(true);
            tokenIdInput.current.focus()
            return false;
        }
        return true;
    }

    async function approveCheck() {
        if (!tokenIdCheck()) {
            return false;
        }
        const approveAddress = await currentNftContract.methods.getApproved(tokenId).call().then(e => {
            return e;
        });
        return approveAddress
    }
    async function approveWallet() {
        try {
            const approveAddress = await approveCheck();
            if (REVEAL_CONTRACT_ADDRESS === approveAddress.toString().toLowerCase()) {
                setApproveStatus(true);
            } else {
                const gasLimit = await currentNftContract.methods.approve(REVEAL_CONTRACT_ADDRESS, tokenId).estimateGas({
                    from: props.accounts[0],
                })
                const gasPrice = await caver.rpc.klay.getGasPrice();
                const approve = await currentNftContract.methods.approve(REVEAL_CONTRACT_ADDRESS, tokenId).send({
                    from: props.accounts[0],
                    gas: gasLimit,
                    gasPrice,
                });
                setApproveStatus(true);
                console.log(approve);
            }
        } catch (e) {
            console.log(e);
            setAlerts("Please check the tokenID");
            setShowAlertModal(true);
            return false

        }
        return false
    }

    const numberCheck = (e) => {
        const regex = /^[0-9\b -]{0,13}$/;
        if (regex.test(e.target.value)) {
            setTokenId(e.target.value);
        }
    }

    async function nftReveal() {
        setShowLoading(true);
        let reveal;
        let alertMsg = `Token ID ${tokenId} Reveal Success`; // 에러메세지
        let revealStatus = false; // 리빌 상태
        try {
            const gasLimit = await revealContract.methods.revealToken(CURRENT_NFT_CONTRACT_ADDRESS, tokenId).estimateGas({
                from: props.accounts[0],
            })
            const gasPrice = await caver.rpc.klay.getGasPrice();
            reveal = await revealContract.methods.revealToken(CURRENT_NFT_CONTRACT_ADDRESS, tokenId).send({
                from: props.accounts[0],
                gas: gasLimit,
                gasPrice,
            });
            console.log(reveal); // 리빌 결과값
            revealStatus = true;
        } catch (e) {
            console.log(e);
            setAlerts("Reveal Fail ");
        }
        // 리빌이 성공하였을때
        if (revealStatus) {
            try {
                const mintResult = await POST(`/api/v1/larvaReveal/save`, {
                    tokenId,
                    txHash: reveal.transactionHash
                }, props.apiToken);
                console.log(mintResult)
                if (mintResult.result === 'error') {
                    throw new Error(mintResult.error);
                }
            } catch (e) {
                console.log(e);
                setAlerts(`${alertMsg}\n(klaytn 네트워크 상황에 따라 민팅이 지연될 수 있습니다.)`);
            }
        }
        setShowAlertModal(true);
        setTokenId("");
        setShowRevealModal(false);
        setShowLoading(false);
        return true;
    }

    return (
        <>
            <section className={styles.reveal_nft}
                     style={{background: `url(${backgroundImg}) no-repeat center center fixed`}}>
                <div className={styles.content_box}>
                    <div>
                        <img src={titleImg} alt="Reveal Larva AniverseNFT"/>
                    </div>
                    {props.accounts && props.accounts.length > 0 && props.isConnected === 'YES' ? (
                        approveStatus === false ? (
                            <button onClick={() => approveWallet()} className={styles.reveal_btn}>APPROVE</button>
                        ) : (
                            <button onClick={() => setShowRevealModal(true)}
                                    className={styles.reveal_btn}>EXCHANGE!</button>
                        )
                    ) : (
                        <button onClick={() => props.handleKaikasConnect()}
                                className={styles.reveal_btn}>APPROVE</button>
                    )}

                    <label className={styles.input_box}>
                        <span>Number</span>
                        <input ref={tokenIdInput} type="text" name="tokenId" value={tokenId} maxLength="4"
                               onChange={numberCheck}/>
                    </label>
                </div>
            </section>
            {/*팝업 모달*/}
            <Modal centered size="lg" show={showAlertModal}
                   onHide={() => setShowAlertModal(false)}>
                <Modal.Body>
                    <div className="text-center mt-5">
                        <p className={styles.alert_msg}> {alerts}</p>
                    </div>
                </Modal.Body>
                <Modal.Footer className={styles.alert_box}>
                    <button variant="" onClick={() => setShowAlertModal(false)} className={styles.alert_btn}>
                        Close
                    </button>
                </Modal.Footer>
            </Modal>
            {/*알림창 모달*/}
            <Modal centered show={showAlertModal}
                   onHide={() => setShowAlertModal(false)}>
                <Modal.Body>
                    <div className="text-center mt-5">
                        <p className={styles.alert_msg}> {alerts}</p>
                    </div>
                </Modal.Body>
                <Modal.Footer className={styles.alert_box}>
                    <button variant="" onClick={() => setShowAlertModal(false)} className={styles.alert_btn}>
                        Close
                    </button>
                </Modal.Footer>
            </Modal>
            {/*리빌확인 모달*/}
            <Modal centered size="lg" show={showRevealModal}
                   onHide={() => setShowRevealModal(false)}>
                <Modal.Body>
                    <div className="text-center mt-5">
                        <p className={styles.alert_msg}>{tokenId} TOKEN을 정말 리빌 하시겠습니까 ?</p>
                    </div>
                </Modal.Body>
                <Modal.Footer className={styles.alert_box}>
                    <button onClick={() => nftReveal()} className={`${styles.alert_btn} ${styles.point_color}`}>
                        Reveal
                    </button>
                    <button onClick={() => setShowRevealModal(false)} className={styles.alert_btn}>
                        Close
                    </button>
                </Modal.Footer>
            </Modal>
            <LoadingModal showLoading={showLoading} setShowLoading={setShowLoading}/>
        </>
    )
}

export default LarvaNFTReveal
