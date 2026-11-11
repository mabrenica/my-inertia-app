import { useEffect, useState } from 'react';

export default function Toast({ message, duration = 2000, onClose }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (!message) return;
        setVisible(true);

        const timer = setTimeout(() => {
            setVisible(false);
            if (onClose) onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [message, duration, onClose]);

    if (!message || !visible) return null;

    return (
        <>
            <style>{`
                @keyframes slideDownFade {
                    from { opacity: 0; transform: translateY(-12px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animated-toast {
                    animation: slideDownFade 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
            <div style={styles.toast} className="animated-toast">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#238636" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>{message}</span>
            </div>
        </>
    );
}

const styles = {
    toast: {
        position: 'fixed',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#161b22',
        border: '1px solid #238636',
        color: '#ffffff',
        padding: '10px 16px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        zIndex: 9999,
    },
};