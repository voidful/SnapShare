import React from 'react';
import './panel.css';
import Iframe from 'react-iframe'

class Panel extends React.Component {

    constructor(props) {
        super(props);
        const {socket} = this.props
        this.socket = socket
        // this.state = {'iframe_loc': 'http://www.google.com'}
    }

    setSocketListeners() {
        this.socket.on('message', (data) => {
            console.log('message', data.message)
        })

        this.socket.on('message_sent', (message) => {
            console.log('message_sent', message)
            let url = message['body']['link'];
            if (!url.match(/^http?:\/\//i) && !url.match(/^https?:\/\//i)) {
                url = 'http://' + url;
            }
            window.open(url, "_blank")
        })
    }

    componentDidMount() {
        this.setSocketListeners()
    }

    render() {
        return (
            <div>
                <div className={"bg-img"}></div>
                {/*<div className={"panel-body"}>*/}
                {/*    <Iframe*/}
                {/*        url={this.state.iframe_loc}*/}
                {/*        frameBorder="0" allow="fullscreen" width="100%" height="100%"/>*/}
                {/*</div>*/}
            </div>

        );
    }
}

export default Panel;
