import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Breadcrumb({ items = [] }) {
    const [canGoBack, setCanGoBack] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCanGoBack(window.history.length > 1);
        }
    }, []);

    const handleBack = () => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
            window.history.back();
        }
    };

    return (
        <>
            <style>{`
                @media (max-width: 768px) {
                    .mobile-hide-breadcrumb-trail {
                        display: none !important;
                    }
                }
                .breadcrumb-back-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #ffffff;
                    color: #1c1c1c;
                    border: 1px solid #d6ccbb;
                    width: 30px;
                    height: 30px;
                    border-radius: 6px;
                    cursor: pointer;
                    text-decoration: none;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                    box-shadow: 0 2px 6px rgba(28, 28, 28, 0.04);
                    flex-shrink: 0;
                }
                .breadcrumb-back-btn:hover {
                    background-color: #ede6d8;
                    border-color: #b5b0a6;
                    transform: translateY(-1px);
                }
                .breadcrumb-back-btn:active {
                    transform: translateY(1px);
                }
            `}</style>

            <div style={styles.outerContainer}>
                {canGoBack && (
                    <button
                        type="button"
                        onClick={handleBack}
                        style={styles.backBtn}
                        className="breadcrumb-back-btn"
                        title="Back to previous page"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                )}

                <nav aria-label="Breadcrumb" className="mobile-hide-breadcrumb-trail" style={styles.container}>
                    {items.map((item, index) => {
                        const isLast = index === items.length - 1;
                        return (
                            <span key={index} style={styles.itemWrapper}>
                                {item.href && !isLast ? (
                                    <Link href={item.href} style={styles.link}>
                                        {item.label}
                                    </Link>
                                ) : (
                                    <span style={isLast ? styles.active : styles.label}>
                                        {item.label}
                                    </span>
                                )}
                                {!isLast && <span style={styles.separator}>/</span>}
                            </span>
                        );
                    })}
                </nav>
            </div>
        </>
    );
}

const styles = {
    outerContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        marginBottom: '12px',
    },
    backBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        display: 'flex',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: '6px',
        fontSize: '12px',
        color: '#6e6962',
        margin: 0,
    },
    itemWrapper: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
    },
    link: {
        color: '#6e6962',
        textDecoration: 'none',
        fontWeight: '500',
    },
    label: {
        color: '#6e6962',
        fontWeight: '500',
    },
    active: {
        color: '#1c1c1c',
        fontWeight: '600',
    },
    separator: {
        color: '#a39b8e',
    },
};
