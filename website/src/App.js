import React, { useMemo } from 'react';
import './App.css';
import Connector from './component/Connector';
import Panel from './component/panel';
import Controller from './component/controller';
import { usePeer } from './hooks/usePeer';
import { getTokenFromUrl } from './utils/utils';

function App() {
    // Get peer ID from URL (for controller/phone)
    const hostPeerId = useMemo(() => getTokenFromUrl(), []);

    // Determine if this is the host (computer) or controller (phone)
    const isHost = !hostPeerId;

    // Initialize peer connection
    const { peerId, connected, error, sendData, onData, callPeer, onIncomingCall } = usePeer(isHost, hostPeerId);

    return (
        <div className="App">
            <header className="App-header">
                {isHost ? (
                    <div>
                        {connected ? (
                            <Panel onData={onData} callPeer={callPeer} />
                        ) : (
                            <Connector peerId={peerId} connected={connected} error={error} />
                        )}
                    </div>
                ) : (
                    <Controller
                        peerId={peerId}
                        connected={connected}
                        error={error}
                        sendData={sendData}
                        onIncomingCall={onIncomingCall}
                    />
                )}
            </header>
        </div>
    );
}

export default App;
