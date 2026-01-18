import React, { useState, useCallback, useRef, useEffect } from 'react';
import './controller.css';
import LiquidLoader from './LiquidLoader';

/**
 * Controller component - shown on the phone side
 * Modes:
 * - link: Send links to open on computer
 * - presentation: Control slides (prev/next, fullscreen)
 * - draw: Draw annotations on computer screen (with Screen Mirroring)
 * - notes: Display notes overlay on computer
 */
function Controller({ connected, error, sendData, onIncomingCall, peerId }) {
    const [mode, setMode] = useState('presentation'); // Default to presentation mode
    const [linkValue, setLinkValue] = useState('');
    const [notesValue, setNotesValue] = useState('');
    const [sent, setSent] = useState(false);

    // Draw Mode State
    const [drawColor, setDrawColor] = useState('#ff4757'); // Default Red
    const [drawWidth, setDrawWidth] = useState(4);
    const touchAreaRef = useRef(null);

    // Link mode handlers
    const handleLinkChange = useCallback((event) => {
        setLinkValue(event.target.value);
        setSent(false);
    }, []);

    const handleLinkSubmit = useCallback((event) => {
        event.preventDefault();
        if (sendData({ type: 'link', url: linkValue })) {
            setSent(true);
            setLinkValue('');
        }
    }, [sendData, linkValue]);

    // Notes mode handlers
    const handleNotesChange = useCallback((event) => {
        setNotesValue(event.target.value);
    }, []);

    const handleNotesSend = useCallback(() => {
        if (sendData({ type: 'notes', text: notesValue })) {
            setSent(true);
            setTimeout(() => setSent(false), 2000);
        }
    }, [sendData, notesValue]);

    const handleClearNotes = useCallback(() => {
        sendData({ type: 'notes', text: '' });
        setNotesValue('');
    }, [sendData]);

    // Presentation mode handlers
    const sendKeyPress = useCallback((key) => {
        sendData({ type: 'keyboard', key });
    }, [sendData]);

    const toggleFullscreen = useCallback(() => {
        sendData({ type: 'fullscreen', action: 'toggle' });
    }, [sendData]);

    // Draw Mode Handlers
    const handleTouchStart = useCallback((e) => {
        // e.preventDefault(); // Prevent scrolling - handled in CSS with touch-action: none
        if (!touchAreaRef.current) return;

        const touch = e.touches[0];
        const rect = touchAreaRef.current.getBoundingClientRect();
        const x = (touch.clientX - rect.left) / rect.width;
        const y = (touch.clientY - rect.top) / rect.height;

        sendData({
            type: 'draw',
            action: 'start',
            x,
            y,
            color: drawColor,
            width: drawWidth
        });
    }, [sendData, drawColor, drawWidth]);

    const handleTouchMove = useCallback((e) => {
        // e.preventDefault(); 
        if (!touchAreaRef.current) return;

        const touch = e.touches[0];
        const rect = touchAreaRef.current.getBoundingClientRect();
        const x = (touch.clientX - rect.left) / rect.width;
        const y = (touch.clientY - rect.top) / rect.height;

        // Clamp values 0-1
        // const clampedX = Math.max(0, Math.min(1, x));
        // const clampedY = Math.max(0, Math.min(1, y));

        sendData({
            type: 'draw',
            action: 'move',
            x,
            y
        });
    }, [sendData]);

    const handleClearDraw = useCallback(() => {
        sendData({ type: 'draw', action: 'clear' });
    }, [sendData]);

    // Error State
    if (error) {
        return (
            <LiquidLoader
                title="連線失敗"
                subtitle="請重新掃描 QR Code"
                error={true}
            >
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                    {error}
                </div>
            </LiquidLoader>
        );
    }

    // Connecting State
    if (!connected) {
        return (
            <LiquidLoader
                title="正在連線..."
                subtitle="正在與電腦建立連線"
            />
        );
    }

    // Connected State - Main Controller UI
    return (
        <div className="liquid-container">
            {/* Background Blobs */}
            <div className="liquid-blob"></div>
            <div className="liquid-blob"></div>
            <div className="liquid-blob"></div>

            <div className="controller-container" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                <div className="controller-header">
                    <img
                        alt="SnapShare Logo"
                        src="https://raw.githubusercontent.com/voidful/SnapShare/master/website/public/logo512.png"
                    />
                    <h2>SnapShare</h2>
                </div>

                <div className="controller-status connected">
                    <span>✓</span>
                    <span>已連線到電腦</span>
                </div>

                {/* Mode Tabs */}
                <div className="mode-tabs">
                    <button
                        className={`mode-tab ${mode === 'presentation' ? 'active' : ''}`}
                        onClick={() => setMode('presentation')}
                        title="簡報控制"
                    >
                        🎮
                    </button>
                    <button
                        className={`mode-tab ${mode === 'mouse' ? 'active' : ''}`}
                        onClick={() => setMode('mouse')}
                        title="滑鼠觸控板"
                    >
                        🖱️
                    </button>
                    <button
                        className={`mode-tab ${mode === 'draw' ? 'active' : ''}`}
                        onClick={() => setMode('draw')}
                        title="螢幕畫筆"
                    >
                        ✏️
                    </button>
                    <button
                        className={`mode-tab ${mode === 'link' ? 'active' : ''}`}
                        onClick={() => setMode('link')}
                        title="開啟連結"
                    >
                        🔗
                    </button>
                    <button
                        className={`mode-tab ${mode === 'notes' ? 'active' : ''}`}
                        onClick={() => setMode('notes')}
                        title="簡報筆記"
                    >
                        📝
                    </button>
                </div>

                {/* Presentation Mode */}
                {mode === 'presentation' && (
                    <div className="presentation-mode">
                        <div className="presentation-label">簡報控制</div>

                        <div className="nav-buttons">
                            <button
                                className="nav-btn prev"
                                onClick={() => sendKeyPress('ArrowUp')}
                            >
                                <span className="nav-icon">◀</span>
                                <span className="nav-text">上一頁</span>
                            </button>
                            <button
                                className="nav-btn next"
                                onClick={() => sendKeyPress('ArrowDown')}
                            >
                                <span className="nav-icon">▶</span>
                                <span className="nav-text">下一頁</span>
                            </button>
                        </div>

                        <div className="presentation-actions">
                            <button
                                className="action-btn fullscreen"
                                onClick={toggleFullscreen}
                            >
                                ⛶ 全螢幕切換
                            </button>
                            <button
                                className="action-btn escape"
                                onClick={() => sendKeyPress('Escape')}
                            >
                                ⏹ 結束簡報
                            </button>
                        </div>

                        <div className="quick-keys">
                            <span className="quick-label">快捷鍵</span>
                            <div className="quick-btns">
                                <button
                                    className="quick-btn"
                                    onClick={() => sendKeyPress('Home')}
                                    title="第一頁"
                                >
                                    ⏮
                                </button>
                                <button
                                    className="quick-btn"
                                    onClick={() => sendKeyPress('End')}
                                    title="最後一頁"
                                >
                                    ⏭
                                </button>
                                <button
                                    className="quick-btn"
                                    onClick={() => sendKeyPress('b')}
                                    title="黑屏 (PowerPoint)"
                                >
                                    🌑
                                </button>
                                <button
                                    className="quick-btn"
                                    onClick={() => sendKeyPress('w')}
                                    title="白屏 (PowerPoint)"
                                >
                                    ⬜
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mouse Mode */}
                {mode === 'mouse' && (
                    <div className="mouse-mode">
                        <div className="mouse-hint">在下方區域滑動以控制滑鼠</div>
                        <div
                            className="trackpad"
                            onTouchStart={(e) => {
                                // e.preventDefault();
                                const touch = e.touches[0];
                                touchAreaRef.current = { x: touch.clientX, y: touch.clientY };
                            }}
                            onTouchMove={(e) => {
                                // e.preventDefault();
                                if (!touchAreaRef.current) return;
                                const touch = e.touches[0];
                                const dx = touch.clientX - touchAreaRef.current.x;
                                const dy = touch.clientY - touchAreaRef.current.y;

                                // Update reference for next move
                                touchAreaRef.current = { x: touch.clientX, y: touch.clientY };

                                sendData({
                                    type: 'mouse',
                                    dx,
                                    dy
                                });
                            }}
                            onTouchEnd={() => {
                                touchAreaRef.current = null;
                            }}
                        >
                            <div className="trackpad-icon">🖱️</div>
                        </div>
                        <div className="mouse-actions">
                            <button
                                className="btn secondary"
                                onClick={() => sendData({ type: 'mouse', isClick: true })}
                            >
                                左鍵點擊
                            </button>
                        </div>
                    </div>
                )}

                {/* Draw Mode */}
                {mode === 'draw' && (
                    <div className="draw-mode">
                        <div className="tool-palette" style={{ zIndex: 1 }}>
                            {/* Colors */}
                            <div className="color-picker">
                                {['#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#ffffff'].map(color => (
                                    <button
                                        key={color}
                                        className={`color-btn ${drawColor === color ? 'active' : ''}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setDrawColor(color)}
                                    />
                                ))}
                            </div>

                            {/* Widths */}
                            <div className="width-picker">
                                {[2, 4, 8, 12].map(width => (
                                    <button
                                        key={width}
                                        className={`width-btn ${drawWidth === width ? 'active' : ''}`}
                                        onClick={() => setDrawWidth(width)}
                                    >
                                        <div style={{
                                            width: width * 2,
                                            height: width * 2,
                                            borderRadius: '50%',
                                            backgroundColor: 'white'
                                        }} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div
                            className="touch-pad"
                            ref={touchAreaRef}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            style={{ background: 'transparent', zIndex: 1 }}
                        >
                            {/* Removed hint to not obstruct video */}
                        </div>

                        <div className="draw-actions" style={{ zIndex: 1 }}>
                            <button className="btn secondary" onClick={handleClearDraw}>
                                🗑️ 清除畫布
                            </button>
                        </div>
                    </div>
                )}

                {/* Link Mode */}
                {mode === 'link' && (
                    <form onSubmit={handleLinkSubmit} className="form-container">
                        <div className="form__group">
                            <label className="form__label">輸入網址</label>
                            <input
                                type="url"
                                className="form__field"
                                placeholder="https://example.com"
                                name="Link"
                                id="link-input"
                                value={linkValue}
                                onChange={handleLinkChange}
                                required
                            />
                        </div>

                        {sent && (
                            <div className="sent-message">✓ 已發送！電腦將開啟連結</div>
                        )}

                        <button className="btn" type="submit" disabled={!linkValue}>
                            📤 發送到電腦
                        </button>
                    </form>
                )}

                {/* Notes Mode */}
                {mode === 'notes' && (
                    <div className="notes-mode">
                        <textarea
                            className="notes-input"
                            placeholder="輸入筆記或註解，會顯示在電腦畫面上..."
                            value={notesValue}
                            onChange={handleNotesChange}
                        />

                        {sent && (
                            <div className="sent-message">✓ 筆記已同步到電腦</div>
                        )}

                        <div className="notes-buttons">
                            <button className="btn" type="button" onClick={handleNotesSend}>
                                📤 顯示筆記
                            </button>
                            <button
                                className="btn secondary"
                                type="button"
                                onClick={handleClearNotes}
                            >
                                🗑️ 清除
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Controller;
