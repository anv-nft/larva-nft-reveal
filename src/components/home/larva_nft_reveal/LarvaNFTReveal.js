import React, {useEffect, useRef, useState} from 'react';
import {POST} from "../../../api/api";
import {Modal, Col, Container, Row,} from 'react-bootstrap';
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
    const AGREE_YN = localStorage.getItem('agreeYN');
    const [showPopupModal, setShowPopupModal] = useState(true);

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

    function tokenIdCheck() {
        if (tokenIdInput.current.value === "") {
            setAlerts("Please enter your token ID.");
            setShowAlertModal(true);
            tokenIdInput.current.focus();
            return false;
        }
        return true;
    }

    async function approveCheck() {

        const approveAddress = await currentNftContract.methods.getApproved(tokenId).call().then(e => {
            return e;
        });
        return approveAddress
    }

    async function approveWallet() {
        if (!tokenIdCheck()) {
            return false;
        }
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
            setAlerts("Please check the tokenID");
            if (e.message === "Returned error: Error: Kaikas Tx Signature: User denied transaction signature.") {
                setAlerts("Kaikas Tx Signature: User denied transaction signature.");
            }
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
        if (!tokenIdCheck()) {
            return false;
        }
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
                setAlerts(`${alertMsg}`);
            }
        }
        setShowAlertModal(true);
        setTokenId("");
        setShowRevealModal(false);
        setShowLoading(false);
        return true;
    }

    function agreePopup() {
        // 로컬스토리지 저장
        // localStorage.setItem('agreeYN', 'Y');
        setShowPopupModal(false);
    }

    useEffect(() => {
        // localStorage.removeItem('agreeYN');
        // 팝업 오늘 하루닫기 체크
        // if (AGREE_YN === null) {
        //     setShowPopupModal(true);
        // } else{
        //     setShowPopupModal(false);
        // }
    }, []);

    useEffect(() => {
        setApproveStatus(false);
    }, [tokenId]);
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
            <Modal centered size="lg" show={showPopupModal}
                   onHide={() => setShowPopupModal(false)} backdrop="static"
                   keyboard={false} dialogClassName="modal-90w">
                <Modal.Header>
                    <Container>
                        <Row>
                            <Col xs={9} md={6}>
                                <Modal.Title>[동의 및 확인]</Modal.Title>
                            </Col>
                            <Col xs={9} md={6}>
                                <Modal.Title>[Agree and Confirm]</Modal.Title>
                            </Col>
                        </Row>
                    </Container>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        <Row>
                            <Col xs={9} md={6}>
                                <div className="text-left">
                                    <p className={styles.popup_msg}>
                                        라바 NEW PFP NFT로 교환하신 이후, 기존의 라바 NFT는 자동 소각됩니다.<br/>
                                        이와 동시에 라바 스테이킹 서비스에서 자동으로 예치 해제되며,<br/>
                                        그동안 해당 라바 NFT로 수확한 리워드 총량은 자동으로 Total Mined KANV로 귀속됩니다.<br/>
                                        <br/>
                                        기존의 라바 NFT로 이용할 수 있는 스테이킹 서비스는 10월 31일 (월) 정오까지 운영할 예정이며,<br/>
                                        이후에는 해당 페이지에 접근할 수 없게 될 예정입니다.<br/>
                                        <br/>
                                        이에 라바 NEW PFP NFT로 전부 교환하신 후,<br/>
                                        이전 스테이킹 서비스에서는 Total Mined KANV를 전부 Get All Rewards 하여 그동안의 리워드를 전부 회수한 후,<br/>
                                        새 스테이킹 서비스에서 다시 지갑 연결하여 풀 별로 스테이킹 시작해 주시면 되겠습니다.<br/>
                                        <br/>
                                        라바 NEW PFP NFT로의 교환 및 그동안의 리워드 회수,<br/>
                                        그리고 새 스테이킹 서비스에서 다시 스테이킹 시작하는 모든 과정을 직접 진행해 주셔야 합니다.<br/>
                                        교환과 동시에 자동 예치되는 것이 아님을 알려드립니다.<br/>
                                        <br/>
                                        감사합니다.
                                    </p>
                                </div>
                            </Col>
                            <Col xs={9} md={6}>
                                <div className="text-left">
                                    <p className={styles.popup_msg}>
                                        After exchanging for Larva NEW PFP NFT, the existing Larva NFT will be
                                        automatically burned.<br/>
                                        At the same time, the deposit is automatically released from the larva staking
                                        service,<br/>
                                        and the total amount of rewards harvested with the larva NFT during that time is
                                        automatically returned to Total Mined KANV.<br/>
                                        <br/>
                                        The staking service that can be used with the existing Larva NFT will operate
                                        until noon on
                                        Monday,<br/>
                                        October 31, after which the page will be inaccessible.<br/>
                                        <br/>
                                        So, after exchanging all of them with Lava NEW PFP NFT,<br/>
                                        you can collect all of the rewards from the previous staking service by getting
                                        all Total
                                        Mined KANV as Get All Rewards,<br/>
                                        then connect your wallet again in the new staking service and start staking by
                                        pool.<br/>
                                        <br/>
                                        Exchanging to Larva NEW PFP NFT, collecting rewards, and staking in the new
                                        staking service
                                        must be performed by yourself.<br/>
                                        Please note that it is not automatically deposited at the same time as the
                                        exchange.<br/>
                                        <br/>
                                        Thank you.
                                    </p>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </Modal.Body>
                <Modal.Footer className={styles.alert_box}>
                    <button variant="" onClick={() => agreePopup()} className={styles.popup_btn}>
                        AGREE
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
                        <p className={styles.alert_msg}>
                            Exchange of Larva NFT token ID {tokenId}.<br/>
                            <span className={styles.alert_msg_span}>※ Existing Larva NFT will be automatically burned, and you will receive the new PFP NFT.</span>
                        </p>
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
