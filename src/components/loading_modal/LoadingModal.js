import React from 'react'
import {Modal} from 'react-bootstrap';
import LoadingImage from "../../assets/images/loading_img.png";
import styles from "./LodingModal.module.scss"

function LoadingModal(props) {

    return (
        <Modal className={styles.loading_box} centered size="xs" show={props.showLoading}
               onHide={() => props.setShowLoading(false)}>
            <Modal.Body>
                <div className={styles.loading_box_text_001}> Loading...</div>
                <div className={styles.loading}>
                    <div className={styles.obj}></div>
                    <div className={styles.obj}></div>
                    <div className={styles.obj}></div>
                    <div className={styles.obj}></div>
                    <div className={styles.obj}></div>
                    <div className={styles.obj}></div>
                    <div className={styles.obj}></div>
                    <div className={styles.obj}></div>
                </div>
                <img className={styles.LoadingModalImage} src={LoadingImage} alt=""/>
            </Modal.Body>
        </Modal>
    )
}

export default LoadingModal
