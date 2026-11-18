import { Link, router } from '@inertiajs/react';

export default function Sidebar({ activePage }) {
    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <>
            <style>{`
                .sidebar-container {
                    width: 240px;
                    background-image: linear-gradient(180deg, #1D1A1B 0%, #151217 100%);
                    border-right: 1px solid #50545D;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 24px 16px;
                    box-sizing: border-box;
                    flex-shrink: 0;
                    z-index: 200;
                }
                .sidebar-nav-item {
                    position: relative;
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .sidebar-nav-item:hover {
                    background-color: rgba(233, 197, 228, 0.16);
                    transform: translateX(4px);
                    color: #FFF8F0 !important;
                }
                .sidebar-logout-btn {
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .sidebar-logout-btn:hover {
                    background-color: rgba(255, 143, 154, 0.14);
                    transform: translateX(4px);
                }
                .mobile-active-dot {
                    display: none;
                }

                @media (max-width: 768px) {
                    .sidebar-container {
                        position: fixed;
                        bottom: 14px;
                        left: 16px;
                        right: 16px;
                        width: auto !important;
                        height: 58px;
                        flex-direction: row !important;
                        align-items: center !important;
                        justify-content: space-between !important;
                        padding: 0 8px !important;
                        border: 1px solid #50545D;
                        border-radius: 999px;
                        background-image: linear-gradient(180deg, #25232B 0%, #1A171C 100%) !important;
                        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28), 0 0 14px rgba(233, 197, 228, 0.14);
                    }
                    .sidebar-nav-section {
                        display: contents !important;
                    }
                    .sidebar-nav-label {
                        display: none !important;
                    }
                    .sidebar-nav-item {
                        flex: 1 1 0 !important;
                        height: 100%;
                        justify-content: center !important;
                        align-items: center !important;
                        padding: 0 !important;
                        gap: 0 !important;
                        border-radius: 999px !important;
                        background-image: none !important;
                        box-shadow: none !important;
                    }
                    .sidebar-nav-item span:not(.mobile-active-dot) {
                        display: none;
                    }
                    .sidebar-nav-item:hover {
                        transform: scale(1.06) !important;
                        background-color: rgba(233, 197, 228, 0.16) !important;
                    }
                    .sidebar-nav-item:active {
                        transform: scale(0.92) !important;
                    }
                    .sidebar-nav-item.is-active {
                        color: #FFF8F0 !important;
                    }
                    .sidebar-nav-item.is-active .sidebar-icon-svg {
                        color: #FFF8F0 !important;
                        transform: translateY(-2px);
                    }
                    .sidebar-icon-svg {
                        width: 20px !important;
                        height: 20px !important;
                        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s ease;
                    }
                    .mobile-active-dot {
                        display: block;
                        position: absolute;
                        bottom: 7px;
                        left: 50%;
                        width: 5px;
                        height: 5px;
                        border-radius: 50%;
                        background-color: #EDF2B2;
                        transform: translateX(-50%) scale(0);
                        opacity: 0;
                        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
                    }
                    .sidebar-nav-item.is-active .mobile-active-dot {
                        transform: translateX(-50%) scale(1);
                        opacity: 1;
                    }
                    .sidebar-logout-container {
                        display: contents !important;
                    }
                    .sidebar-logout-btn {
                        flex: 1 1 0 !important;
                        height: 100%;
                        justify-content: center !important;
                        align-items: center !important;
                        width: auto !important;
                        padding: 0 !important;
                        gap: 0 !important;
                        border-radius: 999px !important;
                    }
                    .sidebar-logout-btn span {
                        display: none;
                    }
                    .sidebar-logout-btn:hover {
                        transform: scale(1.06) !important;
                    }
                    .sidebar-logout-btn:active {
                        transform: scale(0.92) !important;
                    }
                    .sidebar-logout-btn .sidebar-icon-svg {
                        width: 20px !important;
                        height: 20px !important;
                    }
                }
            `}</style>

            <div className="sidebar-container">
                <div style={styles.navSection} className="sidebar-nav-section">
                    <div style={styles.navLabel} className="sidebar-nav-label">Menu</div>

                    <Link
                        href="/home"
                        aria-label="Home"
                        title="Home"
                        className={`sidebar-nav-item ${activePage === 'home' ? 'is-active' : ''}`}
                        style={{
                            ...styles.navItem,
                            ...(activePage === 'home' ? styles.navItemActive : {})
                        }}
                    >
                        <svg className="sidebar-icon-svg" style={styles.navIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span>Home</span>
                        <span className="mobile-active-dot" />
                    </Link>

                    <Link
                        href="/profile"
                        aria-label="My Profile"
                        title="My Profile"
                        className={`sidebar-nav-item ${activePage === 'profile' ? 'is-active' : ''}`}
                        style={{
                            ...styles.navItem,
                            ...(activePage === 'profile' ? styles.navItemActive : {})
                        }}
                    >
                        <svg className="sidebar-icon-svg" style={styles.navIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>My Profile</span>
                        <span className="mobile-active-dot" />
                    </Link>

                    <Link
                        href="/settings"
                        aria-label="Settings"
                        title="Settings"
                        className={`sidebar-nav-item ${activePage === 'settings' ? 'is-active' : ''}`}
                        style={{
                            ...styles.navItem,
                            ...(activePage === 'settings' ? styles.navItemActive : {})
                        }}
                    >
                        <svg className="sidebar-icon-svg" style={styles.navIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Settings</span>
                        <span className="mobile-active-dot" />
                    </Link>
                </div>

                <div style={styles.logoutContainer} className="sidebar-logout-container">
                    <button
                        onClick={handleLogout}
                        aria-label="Log out"
                        title="Log out"
                        style={styles.logoutButton}
                        className="sidebar-logout-btn"
                        type="button"
                    >
                        <svg className="sidebar-icon-svg" style={{ ...styles.navIcon, color: '#FF8F9A' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Log out</span>
                    </button>
                </div>
            </div>
        </>
    );
}

const styles = {
    navSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    navLabel: {
        fontSize: '11px',
        fontWeight: '600',
        color: '#C9C3CC',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        paddingLeft: '10px',
        marginBottom: '8px',
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 12px',
        borderRadius: '8px',
        color: '#C9C3CC',
        fontSize: '13px',
        fontWeight: '500',
        textDecoration: 'none',
    },
    navItemActive: {
        backgroundImage: 'linear-gradient(135deg, #373540 0%, #25232B 100%)',
        color: '#FFF8F0',
        boxShadow: 'inset 2px 0 0 #E9C5E4, 0 0 16px rgba(233, 197, 228, 0.14)',
    },
    navIcon: {
        width: '16px',
        height: '16px',
        color: '#C9C3CC',
        flexShrink: 0,
    },
    logoutContainer: {
        paddingTop: '16px',
        borderTop: '1px solid #50545D',
    },
    logoutButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        padding: '10px 12px',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '8px',
        color: '#FF8F9A',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        textAlign: 'left',
    },
};
