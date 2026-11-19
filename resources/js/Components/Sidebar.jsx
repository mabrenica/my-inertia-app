import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';

export default function Sidebar({ activePage }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        router.post('/logout', {}, {
            onError: () => {
                setIsLoggingOut(false);
            },
            onFinish: () => {
                setIsLoggingOut(false);
            }
        });
    };

    const avatarUrl = user?.avatar
        ? (user.avatar.startsWith('http://') || user.avatar.startsWith('https://') || user.avatar.startsWith('data:')
            ? user.avatar
            : `/storage/${user.avatar}`)
        : null;

    return (
        <>
            <style>{`
                @keyframes spinnerRotate {
                    100% { transform: rotate(360deg); }
                }
                @keyframes spinnerDash {
                    0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
                    50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
                    100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
                }
                .btn-spinner {
                    animation: spinnerRotate 1.4s linear infinite;
                    width: 20px;
                    height: 20px;
                }
                .btn-spinner-circle {
                    animation: spinnerDash 1.2s ease-in-out infinite;
                    stroke-linecap: round;
                }
                @keyframes fadeInOverlay {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUpModal {
                    from { opacity: 0; transform: translateY(14px) scale(0.96); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animated-overlay {
                    animation: fadeInOverlay 0.2s ease-out forwards;
                }
                .animated-modal {
                    animation: slideUpModal 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                .desktop-sidebar-wrapper {
                    padding: 16px 0 16px 16px;
                    box-sizing: border-box;
                    flex-shrink: 0;
                    z-index: 200;
                    display: flex;
                    align-items: center;
                }

                .desktop-sidebar {
                    width: 76px;
                    height: calc(100vh - 32px);
                    background-image: linear-gradient(180deg, #1D1A1B 0%, #151217 100%);
                    border: 1px solid #50545D;
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 20px 14px;
                    box-sizing: border-box;
                    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45), 0 0 20px rgba(233, 197, 228, 0.12);
                    transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    overflow: hidden;
                    position: relative;
                }

                .desktop-sidebar:hover {
                    width: 240px;
                    box-shadow: 0 20px 48px rgba(0, 0, 0, 0.6), 0 0 28px rgba(233, 197, 228, 0.22);
                }

                .sidebar-brand {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 4px 6px;
                    margin-bottom: 24px;
                    white-space: nowrap;
                }

                .sidebar-brand-icon {
                    width: 32px;
                    height: 32px;
                    background-color: rgba(233, 197, 228, 0.18);
                    border: 1px solid rgba(233, 197, 228, 0.45);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #FFF8F0;
                    flex-shrink: 0;
                }

                .sidebar-brand-text {
                    font-size: 15px;
                    font-weight: 700;
                    color: #FFF8F0;
                    letter-spacing: -0.2px;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }

                .desktop-sidebar:hover .sidebar-brand-text {
                    opacity: 1;
                }

                .sidebar-nav-section {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    flex: 1;
                    overflow-x: hidden;
                    overflow-y: auto;
                }

                .sidebar-nav-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: #C9C3CC;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    padding: 0 10px 6px 10px;
                    white-space: nowrap;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }

                .desktop-sidebar:hover .sidebar-nav-label {
                    opacity: 1;
                }

                .sidebar-nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 12px;
                    border-radius: 10px;
                    color: #C9C3CC;
                    font-size: 13px;
                    font-weight: 500;
                    text-decoration: none;
                    position: relative;
                    white-space: nowrap;
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .sidebar-nav-item span {
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }

                .desktop-sidebar:hover .sidebar-nav-item span {
                    opacity: 1;
                }

                .sidebar-nav-item:hover {
                    background-color: rgba(233, 197, 228, 0.16);
                    color: #FFF8F0 !important;
                }

                .sidebar-nav-item.is-active {
                    background-color: #292831;
                    color: #FFF8F0;
                }

                .sidebar-icon-svg {
                    width: 18px;
                    height: 18px;
                    color: #C9C3CC;
                    flex-shrink: 0;
                    transition: color 0.2s ease;
                }

                .sidebar-nav-item:hover .sidebar-icon-svg,
                .sidebar-nav-item.is-active .sidebar-icon-svg {
                    color: #FFF8F0;
                }

                .sidebar-footer {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    padding-top: 16px;
                    border-top: 1px solid #50545D;
                }

                .sidebar-user-card {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                    padding: 8px 6px;
                    background-color: #292831;
                    border: 1px solid #50545D;
                    border-radius: 12px;
                    box-sizing: border-box;
                    white-space: nowrap;
                    overflow: hidden;
                }

                .sidebar-user-left {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    min-width: 0;
                    flex: 1;
                }

                .sidebar-user-avatar {
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 1px solid #50545D;
                    flex-shrink: 0;
                }

                .sidebar-user-avatar-placeholder {
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    background-color: rgba(233, 197, 228, 0.18);
                    border: 1px solid rgba(233, 197, 228, 0.4);
                    color: #FFF8F0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 13px;
                    font-weight: 700;
                    flex-shrink: 0;
                }

                .sidebar-user-meta {
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                    max-width: 0;
                    opacity: 0;
                    visibility: hidden;
                    overflow: hidden;
                    flex: 1;
                    transition: max-width 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease, visibility 0.2s ease;
                }

                .desktop-sidebar:hover .sidebar-user-meta {
                    max-width: 130px;
                    opacity: 1;
                    visibility: visible;
                }

                .sidebar-user-name {
                    color: #FFF8F0;
                    font-size: 12px;
                    font-weight: 600;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .sidebar-user-email {
                    color: #C9C3CC;
                    font-size: 10px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .sidebar-logout-icon-btn {
                    background: rgba(255, 143, 154, 0.08);
                    border: 1px solid rgba(255, 143, 154, 0.25);
                    border-radius: 8px;
                    width: 0;
                    height: 30px;
                    min-width: 0;
                    max-width: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #FF8F9A;
                    cursor: pointer;
                    flex-shrink: 0;
                    opacity: 0;
                    visibility: hidden;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .desktop-sidebar:hover .sidebar-logout-icon-btn {
                    width: 30px;
                    min-width: 30px;
                    max-width: 30px;
                    opacity: 1;
                    visibility: visible;
                }

                .sidebar-logout-icon-btn:hover {
                    background-color: rgba(255, 143, 154, 0.2);
                    border-color: rgba(255, 143, 154, 0.5);
                    transform: translateY(-1px);
                }

                .sidebar-logout-icon-btn:active {
                    transform: translateY(1px);
                }

                /* Mobile Bottom Nav Bar */
                .mobile-bottom-nav {
                    display: none;
                }

                @media (max-width: 768px) {
                    .desktop-sidebar-wrapper {
                        display: none !important;
                    }
                    .mobile-bottom-nav {
                        display: flex !important;
                        position: fixed;
                        bottom: 14px;
                        left: 16px;
                        right: 16px;
                        height: 58px;
                        flex-direction: row !important;
                        align-items: center !important;
                        justify-content: space-between !important;
                        padding: 0 8px !important;
                        border: 1px solid #50545D;
                        border-radius: 999px;
                        background-image: linear-gradient(180deg, #25232B 0%, #1A171C 100%) !important;
                        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28), 0 0 14px rgba(233, 197, 228, 0.14);
                        z-index: 200;
                        box-sizing: border-box;
                    }
                    .mobile-nav-item {
                        flex: 1 1 0 !important;
                        height: 100%;
                        display: flex;
                        justify-content: center !important;
                        align-items: center !important;
                        position: relative;
                        text-decoration: none;
                        background: transparent;
                        border: none;
                        cursor: pointer;
                        border-radius: 999px;
                        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease;
                    }
                    .mobile-nav-item:hover {
                        transform: scale(1.06);
                        background-color: rgba(233, 197, 228, 0.16);
                    }
                    .mobile-nav-item:active {
                        transform: scale(0.92);
                    }
                    .mobile-nav-item.logout-btn:hover {
                        background-color: rgba(255, 143, 154, 0.14);
                    }
                    .mobile-nav-icon {
                        width: 20px !important;
                        height: 20px !important;
                        color: #C9C3CC;
                        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s ease;
                    }
                    .mobile-nav-item.is-active .mobile-nav-icon,
                    .mobile-nav-item:hover .mobile-nav-icon {
                        color: #FFF8F0 !important;
                        transform: translateY(-2px);
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
                    .mobile-nav-item.is-active .mobile-active-dot {
                        transform: translateX(-50%) scale(1);
                        opacity: 1;
                    }
                }
            `}</style>

            {/* Desktop Sidebar */}
            <div className="desktop-sidebar-wrapper">
                <nav className="desktop-sidebar">
                    <div>
                        <div className="sidebar-brand">
                            <div className="sidebar-brand-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFF8F0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="9"></circle>
                                    <path d="M12 3v9l5.5 5.5"></path>
                                </svg>
                            </div>
                            <span className="sidebar-brand-text">FleetFlow</span>
                        </div>

                        <div className="sidebar-nav-section">
                            <div className="sidebar-nav-label">Menu</div>

                            <Link
                                href="/home"
                                aria-label="Home"
                                title="Home"
                                className={`sidebar-nav-item ${activePage === 'home' ? 'is-active' : ''}`}
                            >
                                <svg className="sidebar-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span>Home</span>
                            </Link>

                            <Link
                                href="/profile"
                                aria-label="My Profile"
                                title="My Profile"
                                className={`sidebar-nav-item ${activePage === 'profile' ? 'is-active' : ''}`}
                            >
                                <svg className="sidebar-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>My Profile</span>
                            </Link>

                            <Link
                                href="/settings"
                                aria-label="Settings"
                                title="Settings"
                                className={`sidebar-nav-item ${activePage === 'settings' ? 'is-active' : ''}`}
                            >
                                <svg className="sidebar-icon-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>Settings</span>
                            </Link>
                        </div>
                    </div>

                    <div className="sidebar-footer">
                        <div className="sidebar-user-card" title={user?.name || 'User'}>
                            <div className="sidebar-user-left">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={user?.name || 'User'} className="sidebar-user-avatar" />
                                ) : (
                                    <div className="sidebar-user-avatar-placeholder">
                                        {(user?.name ? user.name.charAt(0).toUpperCase() : 'U')}
                                    </div>
                                )}
                                <div className="sidebar-user-meta">
                                    <span className="sidebar-user-name">{user?.name || 'User'}</span>
                                    <span className="sidebar-user-email">{user?.email || 'user@example.com'}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                aria-label="Log out"
                                title="Log out"
                                type="button"
                                className="sidebar-logout-icon-btn"
                                disabled={isLoggingOut}
                            >
                                <svg className="sidebar-icon-svg" style={{ color: '#FF8F9A', width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </nav>
            </div>

            {/* Mobile Bottom Nav Bar */}
            <div className="mobile-bottom-nav">
                <Link
                    href="/home"
                    aria-label="Home"
                    title="Home"
                    className={`mobile-nav-item ${activePage === 'home' ? 'is-active' : ''}`}
                >
                    <svg className="mobile-nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="mobile-active-dot" />
                </Link>

                <Link
                    href="/profile"
                    aria-label="My Profile"
                    title="My Profile"
                    className={`mobile-nav-item ${activePage === 'profile' ? 'is-active' : ''}`}
                >
                    <svg className="mobile-nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="mobile-active-dot" />
                </Link>

                <Link
                    href="/settings"
                    aria-label="Settings"
                    title="Settings"
                    className={`mobile-nav-item ${activePage === 'settings' ? 'is-active' : ''}`}
                >
                    <svg className="mobile-nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="mobile-active-dot" />
                </Link>

                <button
                    onClick={handleLogout}
                    aria-label="Log out"
                    title="Log out"
                    type="button"
                    className="mobile-nav-item logout-btn"
                    disabled={isLoggingOut}
                >
                    <svg className="mobile-nav-icon" style={{ color: '#FF8F9A' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </div>

            {/* Logout Loading Modal */}
            {isLoggingOut && (
                <div style={styles.modalOverlay} className="animated-overlay">
                    <div style={styles.modalBox} className="animated-modal">
                        <svg viewBox="0 0 50 50" className="btn-spinner" aria-hidden="true">
                            <circle
                                cx="25" cy="25" r="20"
                                fill="none"
                                stroke="#FF8F9A"
                                strokeWidth="5"
                                className="btn-spinner-circle"
                            />
                        </svg>
                        <span style={styles.modalText}>Logging out</span>
                    </div>
                </div>
            )}
        </>
    );
}

const styles = {
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.70)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '16px',
    },
    modalBox: {
        backgroundColor: '#1D1A1B',
        border: '1px solid #50545D',
        borderRadius: '14px',
        padding: '24px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.35), 0 0 20px rgba(255, 143, 154, 0.15)',
        boxSizing: 'border-box',
    },
    modalText: {
        color: '#FFF8F0',
        fontSize: '14px',
        fontWeight: '600',
        letterSpacing: '-0.2px',
    },
};