import React, {useEffect, useRef, useState} from 'react';
import {POST} from "../../../api/api";
import {Modal} from 'react-bootstrap';
import LoadingModal from "../../loading_modal/LoadingModal"
import styles from "./LarvaNFTReveal.module.scss"
import backgroundImg from "../../../assets/images/body_bg.jpg";
import titleImg from "../../../assets/images/title1.png";
import {PAUSABLE_NFT} from "../../../utils/abi/PAUSABLE_NFT";
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
    const CURRENT_NFT_CONTRACT = contracts['current_nft_contract'][props.networkId];
    const REVEAL_NFT_CONTRACT = contracts['reveal_nft_contract'][props.networkId];
    const currentNftContract = new caver.klay.Contract(PAUSABLE_NFT, CURRENT_NFT_CONTRACT);
    const revealNftContract = new caver.klay.Contract(PAUSABLE_NFT, REVEAL_NFT_CONTRACT);
    useEffect(() => {
        setApproveStatus(false);
    }, [tokenId]);

    function tokenIdCheck() {
        if (tokenIdInput.current.value == "") {
            alert("토큰 ID를 입력해주세요.");
            return tokenIdInput.current.focus();
        }
    }

    async function approveCheck() {
        tokenIdCheck();
        const approveAddress = await currentNftContract.methods.getApproved(tokenId).call().then(e => {
            return e;
        });
        return approveAddress
    }
    // 테스트용 민트
    // async function mint() {
    //
    //     const gasLimit = await currentNftContract.methods.mint(props.accounts[0], 7).estimateGas({
    //         from: props.accounts[0],
    //     });
    //     const gasPrice = await caver.rpc.klay.getGasPrice();
    //     const mint = await currentNftContract.methods.mint(props.accounts[0], 7).send({
    //         from: props.accounts[0],
    //         gas: gasLimit,
    //         gasPrice,
    //     });
    // }

    async function approveWallet() {
        try {
            const approveAddress = await approveCheck();
            console.log(REVEAL_NFT_CONTRACT);
            console.log(approveAddress.toLowerCase());
            if (REVEAL_NFT_CONTRACT == approveAddress.toLowerCase()) {
                setApproveStatus(true);
            } else {
                const gasLimit = await currentNftContract.methods.approve(REVEAL_NFT_CONTRACT, tokenId).estimateGas({
                    from: props.accounts[0],
                })
                console.log(currentNftContract);
                console.log(gasLimit);
                console.log(tokenId);
                const gasPrice = await caver.rpc.klay.getGasPrice();
                const approve = await currentNftContract.methods.approve(REVEAL_NFT_CONTRACT, tokenId).send({
                    from: props.accounts[0],
                    gas: gasLimit,
                    gasPrice,
                });
                console.log(approve);
            }
        } catch (e) {
            console.log(e);
            alert('토큰을 확인해주세요.');
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
        try {
            // const mintResult = await POST(`/api/v1/special/mint`, '', props.apiToken);
            // if (mintResult.result === 'success') {
            // 성공시
            const gasLimit = await revealNftContract.methods.reveal(tokenId).estimateGas({
                from: props.accounts[0],
            })
            const gasPrice = await caver.rpc.klay.getGasPrice();
            const reveal = await revealNftContract.methods.reveal(tokenId).send({
                from: props.accounts[0],
                gas: gasLimit,
                gasPrice,
            });
            console.log(reveal);
            setAlerts(`Token ID ${tokenId} Reveal Success`);
            setShowAlertModal(true);
            // } else {
            // 실패시
            //     if (mintResult.error !== {}) {
            //         setAlerts(mintResult.error['_message']);
            //     } else {
            //         setAlerts("Reveal Fail ");
            //     }
            //     setShowAlertModal(true);
            // }
        } catch (e) {
            setAlerts("Reveal Fail ");
            setShowAlertModal(true);
        }
        setShowRevealModal(false);
        setShowLoading(false);
    }

    return (
        <>
            <section className={styles.reveal_nft}
                     style={{background: `url(${backgroundImg}) no-repeat center center fixed`}}>
                <div className={styles.content_box}>
                    <div>
                        {/*<button onClick={() => approveCheck()} className={styles.reveal_btn}>approveCheck!</button>*/}
                        <img src={titleImg}/>
                    </div>
                    {props.accounts && props.accounts.length > 0 && props.isConnected === 'YES' ? (
                        approveStatus === false ? (
                            <button onClick={() => approveWallet()} className={styles.reveal_btn}>APPROVE!</button>
                        ) : (
                            <button onClick={() => setShowRevealModal(true)}
                                    className={styles.reveal_btn}>EXCHANGE!</button>
                        )
                    ) : (
                        <button onClick={() => props.handleKaikasConnect()}
                                className={styles.reveal_btn}>APPROVE!</button>
                    )}

                    <label className={styles.input_box}>
                        <span>Number</span>
                        <input ref={tokenIdInput} type="text" name="tokenId" value={tokenId} maxLength="4"
                               onChange={numberCheck}/>
                    </label>
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
            <Modal centered size="xs" show={showRevealModal}
                   onHide={() => setShowRevealModal(false)}>
                <Modal.Body>
                    <div className="text-center mt-5">
                        <p className={styles.alert_msg}>{tokenId} TOKEN을 정말 리빌 하시겠습니까 ?</p>
                    </div>
                </Modal.Body>
                <Modal.Footer className={styles.alert_box}>
                    <button onClick={() => nftReveal()} className={styles.alert_btn} style="background:#B756FF">
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
