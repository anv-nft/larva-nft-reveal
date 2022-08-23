import React from 'react';
import LarvaNFTReveal from './larva_nft_reveal/LarvaNFTReveal'

export default function Home(props) {

    return (
        <>
            <LarvaNFTReveal accounts={props.accounts} apiToken={props.apiToken} isConnected={props.isConnected}
                            handleKaikasConnect={() => props.handleKaikasConnect()} handleLogout={() => props.handleLogout()}/>
        </>
    );
}
