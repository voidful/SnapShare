import { useEffect, useRef, useState, useCallback } from 'react';
import Peer from 'peerjs';

/**
 * Generate a short random peer ID
 */
function generatePeerId() {
    return 'snap-' + Math.random().toString(36).substring(2, 8);
}

/**
 * Custom hook for PeerJS P2P connections
 * @param {boolean} isHost - Whether this is the host (computer) or controller (phone)
 * @param {string} hostPeerId - For controller: the host's peer ID to connect to
 * @returns {Object} Peer state and methods
 */
export function usePeer(isHost, hostPeerId = null) {
    const peerRef = useRef(null);
    const connectionRef = useRef(null);
    const [peerId, setPeerId] = useState(null);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(null);
    const onDataCallbackRef = useRef(null);

    // Initialize peer
    useEffect(() => {
        const id = isHost ? generatePeerId() : undefined;

        // Auto-detect secure mode based on protocol
        // GitHub Pages (https) -> secure: true
        // Localhost (http) -> secure: false
        const isSecure = window.location.protocol === 'https:';

        console.log(`Initializing PeerJS (secure: ${isSecure})`);

        const peer = new Peer(id, {
            debug: 2,
            secure: isSecure,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' }
                ]
            }
        });

        peer.on('open', (id) => {
            console.log('Peer opened with ID:', id);
            setPeerId(id);
        });

        peer.on('error', (err) => {
            console.error('Peer error:', err);
            setError(err.message || 'Connection Error');
        });

        // Host: listen for incoming connections
        if (isHost) {
            peer.on('connection', (conn) => {
                console.log('Incoming connection from:', conn.peer);
                connectionRef.current = conn;

                conn.on('open', () => {
                    console.log('Connection opened');
                    setConnected(true);
                });

                conn.on('data', (data) => {
                    console.log('Received data:', data);
                    if (onDataCallbackRef.current) {
                        onDataCallbackRef.current(data);
                    }
                });

                conn.on('close', () => {
                    console.log('Connection closed');
                    setConnected(false);
                });
            });
        }

        peerRef.current = peer;

        return () => {
            peer.destroy();
        };
    }, [isHost]);

    // Controller: connect to host
    useEffect(() => {
        if (!isHost && hostPeerId && peerRef.current) {
            const connectToHost = () => {
                if (!peerRef.current || peerRef.current.disconnected) return;

                console.log('Connecting to host:', hostPeerId);
                const conn = peerRef.current.connect(hostPeerId, { reliable: true });
                connectionRef.current = conn;

                conn.on('open', () => {
                    console.log('Connected to host');
                    setConnected(true);
                });

                conn.on('error', (err) => {
                    console.error('Connection error:', err);
                    setError(err.message);
                });

                conn.on('close', () => {
                    console.log('Disconnected from host');
                    setConnected(false);
                });
            };

            // Wait for peer to be ready
            if (peerRef.current.id) {
                connectToHost();
            } else {
                peerRef.current.on('open', connectToHost);
            }
        }
    }, [isHost, hostPeerId]);

    // Send data to connected peer
    const sendData = useCallback((data) => {
        if (connectionRef.current && connectionRef.current.open) {
            connectionRef.current.send(data);
            return true;
        }
        console.warn('No open connection to send data');
        return false;
    }, []);

    // Set callback for receiving data
    const onData = useCallback((callback) => {
        onDataCallbackRef.current = callback;
    }, []);

    // Make a call (for screen sharing)
    const callPeer = useCallback((remoteId, stream) => {
        if (!peerRef.current) return;
        console.log(`Calling peer ${remoteId} with stream`);
        const call = peerRef.current.call(remoteId, stream);
        return call;
    }, []);

    // Listen for incoming calls
    const onIncomingCall = useCallback((callback) => {
        if (!peerRef.current) return;
        peerRef.current.on('call', callback);
    }, []);

    return {
        peerId,
        connected,
        error,
        sendData,
        onData,
        callPeer, // New
        onIncomingCall, // New
        peer: peerRef.current // Expose peer instance if needed
    };
}

export default usePeer;
