import React from 'react';
import './App.css';
import Connecter from "./component/connecter"
import Panel from "./component/panel";
import Controller from "./component/controller";
import io from 'socket.io-client'


let socket_address = window.location.origin
const socket = io(socket_address)

class App extends React.Component {

    constructor(props) {
        super(props);
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        this.state = {ishost: !token, rooms: []};
        this.joinRoom = this.joinRoom.bind(this)
        this.leaveRoom = this.leaveRoom.bind(this)
    }


    joinRoom(token) {
        if (this.state.rooms.indexOf(token) === -1) {
            this.setState({rooms: [...this.state.rooms, token]}, () => {
                socket.emit('join_room', {token})
            })
        }
    }

    leaveRoom(token) {
        this.setState({rooms: this.state.rooms.filter((r) => r !== token)})
    }

    sendMessage(message, token) {
        socket.emit(
            'send_message',
            {
                token,
                body: message,
                timeStamp: Date.now()
            }
        )
    }


    render() {
        return (
            <div className="App">
                <header className="App-header">
                    {this.state.ishost === true && (
                        <div>
                            <Panel socket={socket}/>
                            <Connecter joinRoom={this.joinRoom}
                                       leaveRoom={this.leaveRoom}/>
                        </div>
                    )}
                    {this.state.ishost === false && (
                        <Controller joinRoom={this.joinRoom}
                                    sendMessage={this.sendMessage}/>
                    )}
                </header>
            </div>
        );
    }
}

export default App;
