import React, { useEffect, useCallback, useState, useRef } from 'react';
import './panel.css';
import './liquid.css';
import { normalizeUrl } from '../utils/utils';
import DrawingCanvas from './DrawingCanvas';

/**
 * Window Frame Component
 * Handles layout and UI events for dragging/resizing
 */
const WindowFrame = ({
    windowState,
    title,
    onClose,
    onMinimize,
    onMaximize,
    onFocus,
    onStartDrag,
    onStartResize,
    children,
    zIndex
}) => {
    const { x, y, w, h, isMaximized, isMinimized, isOpen } = windowState;

    if (!isOpen) return null;

    // Computed styles for maximized/minimized/normal states
    const style = isMaximized ? {
        top: 0, left: 0, width: '100%', height: '100%', borderRadius: 0
    } : isMinimized ? {
        top: 'unset', left: 20, bottom: 20, width: 200, height: 40, overflow: 'hidden'
    } : {
        top: y, left: x, width: w, height: h
    };

    return (
        <div
            className={`window-frame ${isMinimized ? 'minimized' : ''}`}
            style={{ ...style, zIndex, visibility: 'visible', opacity: 1 }}
            onMouseDown={onFocus}
            onTouchStart={onFocus}
        >
            {/* Header / Title Bar - Drag Handle */}
            <div
                className="window-header"
                onMouseDown={(e) => !isMaximized && onStartDrag(e, windowState.id)}
                style={{ cursor: isMaximized ? 'default' : 'grab' }}
            >
                <div className="window-title">{title}</div>
                <div className="window-controls" onMouseDown={e => e.stopPropagation()}>
                    <button className="control-btn btn-min" title="Minimize" onClick={onMinimize} />
                    <button className="control-btn btn-max" title="Maximize" onClick={onMaximize} />
                    <button className="control-btn btn-close" title="Close" onClick={onClose} />
                </div>
            </div>

            {/* Content Area */}
            <div className="window-content" style={{ display: isMinimized ? 'none' : 'block' }}>
                {children}
            </div>

            {/* Resize Handle (Bottom Right) */}
            {!isMaximized && !isMinimized && (
                <div
                    className="resize-handle"
                    onMouseDown={(e) => onStartResize(e, windowState.id)}
                />
            )}
        </div>
    );
};

/**
 * Panel component - Desktop Environment
 */
function Panel({ onData, callPeer }) {
    const [notes, setNotes] = useState('');
    const [cursor, setCursor] = useState({ x: 50, y: 50, active: false });

    // Desktop State: History
    const [history, setHistory] = useState([]);

    // Desktop State: Windows
    // Each window: { id, title, x, y, w, h, isOpen, isMaximized, isMinimized, zIndex }
    const [windowStates, setWindowStates] = useState({
        history: { id: 'history', title: 'History Explorer', x: 100, y: 100, w: 600, h: 400, isOpen: true, isMaximized: false, isMinimized: false, zIndex: 10 },
        browser: { id: 'browser', title: 'Virtual Browser', x: 150, y: 50, w: 800, h: 600, isOpen: false, isMaximized: false, isMinimized: false, zIndex: 11 }
    });

    // Browser URL State
    const [browserUrl, setBrowserUrl] = useState('');

    // Interaction State (Dragging/Resizing)
    const interactionRef = useRef({
        type: null, // 'drag' or 'resize'
        targetId: null,
        startX: 0,
        startY: 0,
        initialX: 0,
        initialY: 0,
        initialW: 0,
        initialH: 0
    });

    const canvasRef = useRef(null);
    const iframeRef = useRef(null);

    // --- Window Management ---

    const updateWindowState = (id, updates) => {
        setWindowStates(prev => ({
            ...prev,
            [id]: { ...prev[id], ...updates }
        }));
    };

    const bringToFront = (id) => {
        setWindowStates(prev => {
            const maxZ = Math.max(...Object.values(prev).map(w => w.zIndex || 0));
            if (prev[id].zIndex === maxZ) return prev; // Already on top
            return {
                ...prev,
                [id]: { ...prev[id], zIndex: maxZ + 1 }
            };
        });
    };

    const openWindow = (id) => {
        updateWindowState(id, { isOpen: true, isMinimized: false });
        bringToFront(id);
    };

    const closeWindow = (id) => {
        updateWindowState(id, { isOpen: false });
    };

    const toggleMaximize = (id) => {
        setWindowStates(prev => ({
            ...prev,
            [id]: { ...prev[id], isMaximized: !prev[id].isMaximized }
        }));
    };

    const toggleMinimize = (id) => {
        setWindowStates(prev => ({
            ...prev,
            [id]: { ...prev[id], isMinimized: !prev[id].isMinimized }
        }));
    };

    // --- Interaction Handlers (Drag / Resize) ---

    // Called by real mouse OR virtual mouse simulation
    const handleInteractionStart = (e, type, id) => {
        e.preventDefault();
        e.stopPropagation();
        bringToFront(id);

        const win = windowStates[id];
        interactionRef.current = {
            type, // 'drag' or 'resize'
            targetId: id,
            startX: e.clientX,
            startY: e.clientY,
            initialX: win.x,
            initialY: win.y,
            initialW: win.w,
            initialH: win.h
        };

        // Attach global listeners for move/up to handle drag even if mouse leaves element
        document.addEventListener('mousemove', handleGlobalMouseMove);
        document.addEventListener('mouseup', handleGlobalMouseUp);
    };

    const handleStartDrag = (e, id) => handleInteractionStart(e, 'drag', id);
    const handleStartResize = (e, id) => handleInteractionStart(e, 'resize', id);

    const handleGlobalMouseMove = useCallback((e) => {
        const { type, targetId, startX, startY, initialX, initialY, initialW, initialH } = interactionRef.current;
        if (!type || !targetId) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (type === 'drag') {
            updateWindowState(targetId, {
                x: initialX + dx,
                y: initialY + dy
            });
        } else if (type === 'resize') {
            updateWindowState(targetId, {
                w: Math.max(200, initialW + dx),
                h: Math.max(150, initialH + dy)
            });
        }
    }, [windowStates]); // Added windowStates to dependencies to ensure updateWindowState has latest state

    const handleGlobalMouseUp = useCallback(() => {
        interactionRef.current = { type: null, targetId: null };
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
    }, [handleGlobalMouseMove]);


    // --- Virtual Mouse Event Simulation ---

    const simulateMouseEvent = useCallback((type, x, y, isClick = false) => {
        // Convert % coordinates to pixels
        const clientX = (x / 100) * window.innerWidth;
        const clientY = (y / 100) * window.innerHeight;

        // Find the element at this position
        // We temporarily hide the cursor so elementFromPoint sees what's under it
        const cursorEl = document.querySelector('.virtual-cursor');
        if (cursorEl) cursorEl.style.display = 'none';

        const targetElement = document.elementFromPoint(clientX, clientY) || document.body;

        if (cursorEl) cursorEl.style.display = 'block';

        // If it's a click sequence, we execute mousedown -> mouseup -> click
        if (isClick) {
            const down = new MouseEvent('mousedown', {
                view: window, bubbles: true, cancelable: true, clientX, clientY, buttons: 1
            });
            const up = new MouseEvent('mouseup', {
                view: window, bubbles: true, cancelable: true, clientX, clientY, buttons: 0
            });
            const click = new MouseEvent('click', {
                view: window, bubbles: true, cancelable: true, clientX, clientY, buttons: 0
            });

            targetElement.dispatchEvent(down);
            setTimeout(() => targetElement.dispatchEvent(up), 50);
            setTimeout(() => targetElement.dispatchEvent(click), 100);
        } else {
            // Otherwise just dispatch the requested single event (e.g. mousemove)
            const event = new MouseEvent(type, {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX: clientX,
                clientY: clientY,
                buttons: type === 'mousemove' ? 0 : 1
            });
            targetElement.dispatchEvent(event);
        }
    }, []);


    // --- Data Handling ---

    const handleData = useCallback(async (data) => {
        if (data?.type === 'link' && data?.url) {
            const url = normalizeUrl(data.url);
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            setHistory(prev => [{ url, timeString, timestamp: now }, ...prev]);
            setBrowserUrl(url);
            openWindow('browser');
        }

        if (data?.type === 'mouse') {
            const { dx, dy, isClick } = data;

            setCursor(prev => {
                // Movement
                let newX = prev.x;
                let newY = prev.y;
                if (dx !== undefined && dy !== undefined) {
                    const sensitivity = 0.15;
                    newX = Math.max(0, Math.min(100, prev.x + (dx * sensitivity)));
                    newY = Math.max(0, Math.min(100, prev.y + (dy * sensitivity)));
                }

                // If clicking, dispatch click at current position
                if (isClick && dx === undefined) { // Pure click
                    simulateMouseEvent('click', newX, newY, true);
                } else if (dx !== undefined || dy !== undefined) {
                    // Move
                    // If "dragging" support is needed from touchpad, we'd need 'touch-down' state.
                    // For now, just move:
                    simulateMouseEvent('mousemove', newX, newY);
                }

                return { x: newX, y: newY, active: true };
            });
        }

        // Handle other types...
        if (data?.type === 'notes') setNotes(data.text || '');
        if (data?.type === 'keyboard' && data?.key) {
            // Ensure focus is on iframe if browser is open
            if (windowStates.browser.isOpen && iframeRef.current) {
                iframeRef.current.focus();
            }
            simulateKeyPress(data.key);
        }
        if (data?.type === 'fullscreen') toggleFullscreen();

        if (data?.type === 'draw' && canvasRef.current) {
            const { action, x, y, color, width } = data;
            if (action === 'start') canvasRef.current.startPath(x, y, color, width);
            if (action === 'move') canvasRef.current.drawPath(x, y);
            if (action === 'clear') canvasRef.current.clear();
        }

    }, [simulateMouseEvent, callPeer]);

    // Data Listener
    useEffect(() => {
        onData(handleData);
    }, [onData, handleData]);


    // --- Render ---

    return (
        <div className="panel-container liquid-container">
            {/* Background Blobs */}
            <div className="liquid-blob"></div>
            <div className="liquid-blob"></div>
            <div className="liquid-blob"></div>

            <div className="desktop-environment">

                {/* Desktop Icons */}
                <div className="desktop-icons-area">
                    <div className="desktop-icon" onClick={() => openWindow('history')}>
                        <div className="icon-img">📁</div>
                        <div className="icon-label">History</div>
                    </div>
                    <div className="desktop-icon" onClick={() => browserUrl && openWindow('browser')}>
                        <div className="icon-img">🌐</div>
                        <div className="icon-label">Browser</div>
                    </div>
                    <div className="desktop-icon">
                        <div className="icon-img">💻</div>
                        <div className="icon-label">My PC</div>
                    </div>
                </div>

                {/* History Window */}
                <WindowFrame
                    windowState={windowStates.history}
                    title="History Explorer"
                    onClose={() => closeWindow('history')}
                    onMinimize={() => toggleMinimize('history')}
                    onMaximize={() => toggleMaximize('history')}
                    onFocus={() => bringToFront('history')}
                    onStartDrag={handleStartDrag}
                    onStartResize={handleStartResize}
                    zIndex={windowStates.history.zIndex}
                >
                    <div className="history-list">
                        {history.length === 0 && (
                            <div style={{ padding: '20px', color: '#888', textAlign: 'center' }}>
                                No history yet. Send a link from your phone!
                            </div>
                        )}
                        {history.map((item, index) => (
                            <div
                                key={index}
                                className="history-item"
                                onClick={() => {
                                    setBrowserUrl(item.url);
                                    openWindow('browser');
                                }}
                            >
                                <div className="file-icon">📄</div>
                                <div className="file-info">
                                    <div className="file-name">{item.url}</div>
                                    <div className="file-meta">Received at {item.timeString}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </WindowFrame>

                {/* Browser Window */}
                <WindowFrame
                    windowState={windowStates.browser}
                    title={`Virtual Browser - ${browserUrl || 'Empty'}`}
                    onClose={() => closeWindow('browser')}
                    onMinimize={() => toggleMinimize('browser')}
                    onMaximize={() => toggleMaximize('browser')}
                    onFocus={() => bringToFront('browser')}
                    onStartDrag={handleStartDrag}
                    onStartResize={handleStartResize}
                    zIndex={windowStates.browser.zIndex}
                >
                    {browserUrl ? (
                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                            {/* Overlay to capture mouse events when dragging over iframe */}
                            {interactionRef.current.type && (
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 999
                                }} />
                            )}
                            {/* Toolbar for external actions */}
                            <div style={{
                                position: 'absolute', top: 0, right: 20, zIndex: 100,
                                background: 'rgba(0,0,0,0.5)', padding: '5px',
                                borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px'
                            }}>
                                <button
                                    onClick={() => window.open(browserUrl, '_blank')}
                                    title="Open in New Tab (Full Control)"
                                    style={{
                                        background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px'
                                    }}
                                >
                                    ↗️ Open in New Tab
                                </button>
                            </div>

                            <iframe
                                ref={iframeRef}
                                src={browserUrl}
                                className="browser-iframe"
                                title="Remote Browser"
                                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                            />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#ccc' }}>
                            Waiting for link...
                        </div>
                    )}
                </WindowFrame>

                {/* Taskbar */}
                <div className="taskbar">
                    <div className="start-btn">❖</div>
                    <div style={{ color: 'white', fontSize: '14px', marginLeft: 'auto' }}>
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>

            {/* Virtual Cursor */}
            {cursor.active && (
                <div
                    className="virtual-cursor"
                    style={{ left: `${cursor.x}%`, top: `${cursor.y}%` }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" fill="rgba(0,0,0,0.5)" />
                    </svg>
                </div>
            )}

            {/* Notes Overlay */}
            {notes && <div className="notes-overlay">{notes}</div>}

            {/* Drawing Canvas */}
            <DrawingCanvas ref={canvasRef} active={true} />
        </div>
    );
}

/**
 * Simulate Keyboard Events (Helpers)
 */
const simulateKeyPress = (key) => {
    const keyCodes = {
        'ArrowLeft': 37, 'ArrowUp': 38, 'ArrowRight': 39, 'ArrowDown': 40,
        'Escape': 27, 'Enter': 13, 'Space': 32, 'Tab': 9, 'Home': 36, 'End': 35,
        'b': 66, 'B': 66, 'w': 87, 'W': 87
    };
    const keyCode = keyCodes[key] || key.charCodeAt(0);

    const eventOptions = {
        key: key,
        code: key,
        keyCode: keyCode,
        which: keyCode,
        bubbles: true,
        cancelable: true,
        view: window
    };

    // Dispatch to active element (iframe if focused)
    const activeElement = document.activeElement || document.body;
    activeElement.dispatchEvent(new KeyboardEvent('keydown', eventOptions));
    activeElement.dispatchEvent(new KeyboardEvent('keyup', eventOptions));

    // Also dispatch to document/window for global handlers
    document.dispatchEvent(new KeyboardEvent('keydown', eventOptions));
    window.dispatchEvent(new KeyboardEvent('keydown', eventOptions));
    window.dispatchEvent(new KeyboardEvent('keyup', eventOptions));
};

const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => { });
    else document.exitFullscreen().catch(() => { });
};

export default Panel;
