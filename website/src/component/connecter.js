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
                <div className={"snapshare"}>
                    <img height={"100%"} alt={"snapshare"}
                         src={"https://raw.githubusercontent.com/voidful/SnapShare/master/website/public/logo512.png"}>
                    </img>
                    <h2 className={"intro"}>SnapShare</h2>
                </div>
                <QRCode value={this.state.token} width={"90%"} height={"90%"} renderAs={'svg'}/>
                <div className={"intro"}>{"Send the link via your phone. \n Scan, Paste and Magic ！"}</div>
                <footer>
                    <a href="https://github.com/voidful/SnapShare" target="_blank">
                        <i className="icon-social-github icons"></i>
                    </a>
                </footer>
            </section>
        );
    }
}

export default Connecter;
