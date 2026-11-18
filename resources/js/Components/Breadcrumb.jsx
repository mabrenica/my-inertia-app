
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Breadcrumb({
    items = [],
    showBackButton = true
}) {
    const [canGoBack, setCanGoBack] = useState(false);

    const { url } = usePage();

    // Hide the back button on the Home page only
    const currentPath = url?.split('?')[0].replace(/\/+$/, '');
    const isHomePage = currentPath === '/home';

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCanGoBack(window.history.length > 1);
        }
    }, []);

    const handleBack = () => {
        if (
            typeof window !== 'undefined' &&
            window.history.length > 1
        ) {
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
                    background-color: #1D1A1B;
                    color: #FFF8F0;
                    border: 1px solid #50545D;
                    width: 30px;
                    height: 30px;
                    padding: 0;
                    border-radius: 6px;
                    cursor: pointer;
                    text-decoration: none;
                    transition: all 0.2s cubic-bezier(
                        0.16, 1, 0.3, 1
                    );
                    box-shadow:
                        0 2px 6px rgba(0, 0, 0, 0.04),
                        0 0 14px rgba(233, 197, 228, 0.14);
                    flex-shrink: 0;
                    box-sizing: border-box;
                }

                .breadcrumb-back-btn:hover {
                    background-color: #292831;
                    border-color: #E9C5E4;
                    transform: translateY(-1px);
                }

                .breadcrumb-back-btn:active {
                    transform: translateY(1px);
                }
            `}</style>

            <div style={styles.outerContainer}>

                {/* Back button hidden on Home only */}
                {showBackButton && !isHomePage && canGoBack && (
                    <button
                        type="button"
                        onClick={handleBack}
                        style={styles.backBtn}
                        className="breadcrumb-back-btn"
                        title="Back to previous page"
                    >
                        <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line
                                x1="19"
                                y1="12"
                                x2="5"
                                y2="12"
                            />
                            <polyline
                                points="12 19 5 12 12 5"
                            />
                        </svg>
                    </button>
                )}

                {/* Breadcrumb navigation */}
                <nav
                    aria-label="Breadcrumb"
                    className="mobile-hide-breadcrumb-trail"
                    style={styles.container}
                >
                    {items.map((item, index) => {
                        const isLast = index === items.length - 1;

                        return (
                            <span
                                key={index}
                                style={styles.itemWrapper}
                            >
                                {item.href && !isLast ? (
                                    <Link
                                        href={item.href}
                                        style={styles.link}
                                    >
                                        {item.label}
                                    </Link>
                                ) : (
                                    <span
                                        style={
                                            isLast
                                                ? styles.active
                                                : styles.label
                                        }
                                    >
                                        {item.label}
                                    </span>
                                )}

                                {!isLast && (
                                    <span style={styles.separator}>
                                        /
                                    </span>
                                )}
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
        minHeight: '30px',
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
        gap: '6px',
        fontSize: '12px',
        lineHeight: '1',
        color: '#C9C3CC',
        margin: 0,
    },

    itemWrapper: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        lineHeight: '1',
    },

    link: {
        color: '#C9C3CC',
        textDecoration: 'none',
        fontWeight: '500',
        lineHeight: '1',
    },

    label: {
        color: '#C9C3CC',
        fontWeight: '500',
        lineHeight: '1',
    },

    active: {
        color: '#FFF8F0',
        fontWeight: '600',
        lineHeight: '1',
    },

    separator: {
        color: '#E9C5E4',
        lineHeight: '1',
    },
};
