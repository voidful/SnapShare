import React from 'react';
import QRCode from 'qrcode.react'

class Connecter extends React.Component {


    constructor(props) {
        super(props);
        const {joinRoom, leaveRoom} = this.props
        const token = this.init_token()
        this.state = {token: window.location.origin + '?token=' + token};
        joinRoom(token)
        console.log(this.state.token)
    }

    init_token() {
        return Math.random().toString(36).substr(2);
    }


    render() {
        return (
            <section id="banner" style={{z_index: -1, position: 'relative'}}>
                <QRCode value={this.state.token} size={512} renderAs={'svg'} />
            </section>
        );
    }
}

export default Connecter;
