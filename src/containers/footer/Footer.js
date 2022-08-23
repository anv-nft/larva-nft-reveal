import React from 'react'
import logo2 from "../../assets/images/aniverse_logo.png";
import styles from "./Footer.module.scss"

function Footer() {
    return (
        <div className={styles.footer}>
            <div>
                <img src={logo2} style={{width: '200px'}} alt="footer logo"/>
            </div>
            <div>
                <a href="mailto:contact@aniverse.io">contact@aniverse.io</a>
            </div>
            <div>
                <p>COPYRIGHT © 2021 ANIVERSE All RIGHTS RESERVED. </p>
            </div>
        </div>
    )
}

export default Footer
