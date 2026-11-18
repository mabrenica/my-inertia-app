
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
                    from {
                        opacity: 0;
                        transform: translate(-50%, -14px) scale(0.96);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, 0) scale(1);
                    }
                }

                .fleetflow-toast {
                    position: fixed;
                    top: 24px;
                    left: 50%;
                    transform: translate(-50%, 0);
                    z-index: 1200;
                    background-color: #110D08;
                    color: #FFF8F0;
                    border: 1px solid #50545D;
                    border-left: 3px solid #EDF2B2;
                    border-radius: 10px;
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    gap: 10px;
                    font-size: 13px;
                    font-weight: 500;
                    box-shadow:
                        0 12px 28px rgba(0, 0, 0, 0.22),
                        0 0 14px rgba(233, 197, 228, 0.14);
                    width: max-content;
                    max-width: calc(100vw - 48px);
                    box-sizing: border-box;
                    animation: toastSlideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                .fleetflow-toast span {
                    color: #FFF8F0;
                }

                @media (max-width: 768px) {
                    .fleetflow-toast {
                        top: 16px;
                        max-width: calc(100vw - 32px);
                    }
                }
            `}</style>

            <div
                role="status"
                aria-live="polite"
                className="fleetflow-toast"
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#EDF2B2"
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
