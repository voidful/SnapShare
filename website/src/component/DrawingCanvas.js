import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';

/**
 * DrawingCanvas Component
 * Transparent overlay that renders drawing commands
 * 
 * Props:
 * - active: boolean (whether drawing layer is visible/active)
 */
const DrawingCanvas = forwardRef(({ active }, ref) => {
    const canvasRef = useRef(null);
    const [ctx, setCtx] = useState(null);

    // Initialize canvas context
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        setCtx(context);

        // Handle resizing
        const handleResize = () => {
            const ratio = window.devicePixelRatio || 1;

            canvas.width = window.innerWidth * ratio;
            canvas.height = window.innerHeight * ratio;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;

            // Re-scale context
            context.scale(ratio, ratio);
            context.lineCap = 'round';
            context.lineJoin = 'round';
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial setup

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Expose drawing methods to parent via ref
    useImperativeHandle(ref, () => ({
        /**
         * Start a new path
         */
        startPath: (x, y, color, width) => {
            if (!ctx) return;
            const realX = x * window.innerWidth;
            const realY = y * window.innerHeight;

            ctx.beginPath();
            ctx.moveTo(realX, realY);
            ctx.strokeStyle = color || '#ff0000';
            ctx.lineWidth = width || 5;
        },

        /**
         * Continue the path
         */
        drawPath: (x, y) => {
            if (!ctx) return;
            const realX = x * window.innerWidth;
            const realY = y * window.innerHeight;

            ctx.lineTo(realX, realY);
            ctx.stroke();
        },

        /**
         * Clear the canvas
         */
        clear: () => {
            if (!ctx || !canvasRef.current) return;
            // Use local canvas dimensions for clearRect
            // Note: with scale(), we might need to clear using logic coord or reset transform
            // Simpler to just clear huge area or reset transform
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.restore();
        }
    }));

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none', // Allow clicks to pass through
                zIndex: 999, // Below the notes overlay (1000)
                opacity: active ? 1 : 0,
                transition: 'opacity 0.3s ease',
                background: 'transparent'
            }}
        />
    );
});

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;
