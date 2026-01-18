import React, { useMemo } from 'react';
import QRCode from 'qrcode.react';
import { buildConnectionUrl } from '../utils/utils';
import LiquidLoader from './LiquidLoader';
import './liquid.css';

/**
 * Connector component - displays QR code for phone to scan
 * Shows connection status with Liquid Glass design
 */
function Connector({ peerId, connected, error }) {
    const connectionUrl = useMemo(() => {
        return peerId ? buildConnectionUrl(peerId) : '';
    }, [peerId]);

    // Error State
    if (error) {
        return (
            <LiquidLoader
                title="連線錯誤"
                subtitle="請確認網路狀態，或稍後再試"
                error={true}
            >
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                    {error}
                </div>
            </LiquidLoader>
        );
    }

    // Initial Loading State (Generating Peer ID)
    if (!peerId) {
        return (
            <LiquidLoader
                title="SnapShare"
                subtitle="正在初始化連線 ID..."
            />
        );
    }

    // Main QR Code State
    return (
        <div className="liquid-container">
            {/* Background Blobs */}
            <div className="liquid-blob"></div>
            <div className="liquid-blob"></div>
            <div className="liquid-blob"></div>

            {/* Main Content Glass Panel */}
            <div className="glass-panel" style={{ width: 'auto', minWidth: '320px', maxWidth: '400px', padding: '2.5rem' }}>
                <div className="controller-header" style={{ marginBottom: '1.5rem' }}>
                    <img
                        alt="SnapShare Logo"
                        src="https://raw.githubusercontent.com/voidful/SnapShare/master/website/public/logo512.png"
                    />
                    <h2>SnapShare</h2>
                </div>

                <div className="qr-container" style={{ margin: '0 auto' }}>
                    <QRCode value={connectionUrl} size={180} renderAs="svg" />
                </div>

                <div className="status" style={{ marginTop: '1.5rem' }}>
                    {connected ? (
                        <div className="controller-status connected">
                            <span>✓</span>
                            <span>手機已連線</span>
                        </div>
                    ) : (
                        <div className="liquid-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                            <span className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px' }}></span>
                            等待手機掃描連線...
                        </div>
                    )}
                </div>

                <p className="liquid-subtitle" style={{ fontSize: '0.9rem', marginTop: '1rem', lineHeight: '1.5' }}>
                    用手機掃描 QR Code<br />
                    貼上連結，電腦自動開啟
                </p>
            </div>

            <footer style={{ marginTop: '2rem', zIndex: 1 }}>
                <a
                    href="https://github.com/voidful/SnapShare"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="GitHub"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        backdropFilter: 'blur(5px)',
                        transition: 'transform 0.2s'
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                </a>
            </footer>
        </div>
    );
}

export default Connector;
