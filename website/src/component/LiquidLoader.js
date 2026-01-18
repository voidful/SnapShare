import React from 'react';
import './liquid.css';

/**
 * Liquid Loader Component
 * Displays a loading screen with liquid glass animations
 * @param {string} title - Main loading text
 * @param {string} subtitle - Subtitle or description
 * @param {boolean} error - Whether to show error state
 * @param {React.ReactNode} children - Optional content to render inside the glass panel
 */
function LiquidLoader({ title, subtitle, error, children }) {
    return (
        <div className="liquid-container">
            {/* Background Blobs */}
            <div className="liquid-blob"></div>
            <div className="liquid-blob"></div>
            <div className="liquid-blob"></div>

            {/* Content Panel */}
            <div className={`glass-panel ${error ? 'error' : ''}`}>
                <div className="liquid-spinner"></div>

                <h2 className="liquid-title">{title || 'Loading...'}</h2>

                {subtitle && (
                    <p className="liquid-subtitle">{subtitle}</p>
                )}

                {children && (
                    <div style={{ marginTop: '1.5rem', width: '100%' }}>
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}

export default LiquidLoader;
