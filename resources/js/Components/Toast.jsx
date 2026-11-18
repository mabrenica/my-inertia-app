import { useEffect } from 'react';

export default function Toast({ message, duration = 1000, onClose }) {
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => {
            if (onClose) onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [message, duration, onClose]);

    if (!message) return null;

    return (
        <>
            <style>{`
                @keyframes toastSlideDown {
                    from { opacity: 0; transform: translate(-50%, -14px) scale(0.96); }
                    to { opacity: 1; transform: translate(-50%, 0) scale(1); }
                }
                .fleetflow-toast {
                    position: fixed;
                    top: 24px;
                    left: 50%;
                    transform: translate(-50%, 0);
                    z-index: 1200;
                    background-color: #F4EEE0;
                    color: #F4EEE0;
                    border: 1px solid #49483E;
                    border-left: 3px solid #8D6643;
                    border-radius: 10px;
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    gap: 10px;
                    font-size: 13px;
                    font-weight: 500;
                    box-shadow: 0 12px 28px rgba(28, 28, 28, 0.22), 0 0 14px rgba(141, 102, 67, 0.14);
                    width: max-content;
                    max-width: calc(100vw - 48px);
                    box-sizing: border-box;
                    animation: toastSlideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @media (max-width: 768px) {
                    .fleetflow-toast {
                        top: 16px;
                        max-width: calc(100vw - 32px);
                    }
                }
            `}</style>

            <div role="status" aria-live="polite" className="fleetflow-toast">
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#8D6643"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0 }}
                >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>{message}</span>
            </div>
        </>
    );
}