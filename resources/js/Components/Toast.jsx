import { useEffect, useState } from 'react';

export default function Toast({ message, duration = 3000, onClose }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!message) {
            setVisible(false);
            return;
        }

        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
            if (onClose) setTimeout(onClose, 300); // Wait for exit animation
        }, duration);

        return () => clearTimeout(timer);
    }, [message, duration, onClose]);

    if (!message && !visible) return null;

    return (
        <div style={{
            ...styles.toastContainer,
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0) scale(1)' : 'translateY(-12px) scale(0.96)',
        }}>
            <style>{`
                .toast-box {
                    transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
            <div style={styles.toastBox} className="toast-box">
                <div style={styles.iconCircle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2F6BFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <span style={styles.toastText}>{message}</span>
            </div>
        </div>
    );
}

const styles = {
    toastContainer: {
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 9999,
        pointerEvents: 'none',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    },
    toastBox: {
        backgroundColor: '#131722',
        border: '1px solid #252D45',
        borderRadius: '12px',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 -2px 0 rgba(0, 0, 0, 0.6), 0 12px 30px rgba(0, 0, 0, 0.7), 0 4px 8px rgba(0, 0, 0, 0.4)',
        pointerEvents: 'auto',
    },
    iconCircle: {
        width: '24px',
        height: '24px',
        backgroundColor: 'rgba(47, 107, 255, 0.15)',
        border: '1px solid rgba(47, 107, 255, 0.4)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    },
    toastText: {
        color: '#FFFFFF',
        fontSize: '13px',
        fontWeight: '600',
        letterSpacing: '-0.2px',
    },
};
