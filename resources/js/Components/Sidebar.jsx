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
                    background-image: linear-gradient(180deg, #1c1c1c 0%, #141414 100%);
                    border-right: 1px solid #2e2e2e;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 24px 16px;
                    box-sizing: border-box;
                    flex-shrink: 0;
                }
                .sidebar-nav-item {
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .sidebar-nav-item:hover {
                    background-color: rgba(237, 230, 216, 0.08);
                    transform: translateX(4px);
                    color: #ede6d8 !important;
                }
                .sidebar-logout-btn {
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .sidebar-logout-btn:hover {
                    background-color: rgba(179, 37, 30, 0.12);
                    transform: translateX(4px);
                }
                @media (max-width: 768px) {
                    .sidebar-container {
                        width: 100% !important;
                        flex-direction: row !important;
                        align-items: center;
                        padding: 12px 16px !important;
                        border-right: none !important;
                        border-bottom: 1px solid #2e2e2e;
                        overflow-x: auto;
                    }
                    .sidebar-nav-section {
                        flex-direction: row !important;
                        gap: 8px !important;
                        align-items: center;
                    }
                    .sidebar-nav-label {
                        display: none !important;
                    }
                    .sidebar-logout-container {
                        border-top: none !important;
                        padding-top: 0 !important;
                    }
                }
            `}</style>

            <div className="sidebar-container">
                <div style={styles.navSection} className="sidebar-nav-section">
                    <div style={styles.navLabel} className="sidebar-nav-label">Menu</div>
                    
                    <Link 
                        href="/home" 
                        className="sidebar-nav-item"
                        style={{
                            ...styles.navItem,
                            ...(activePage === 'home' ? styles.navItemActive : {})
                        }}
                    >
                        <svg style={styles.navIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span>Home</span>
                    </Link>

                    <Link 
                        href="/profile" 
                        className="sidebar-nav-item"
                        style={{
                            ...styles.navItem,
                            ...(activePage === 'profile' ? styles.navItemActive : {})
                        }}
                    >
                        <svg style={styles.navIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>My Profile</span>
                    </Link>

                    <Link 
                        href="/settings" 
                        className="sidebar-nav-item"
                        style={{
                            ...styles.navItem,
                            ...(activePage === 'settings' ? styles.navItemActive : {})
                        }}
                    >
                        <svg style={styles.navIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Settings</span>
                    </Link>
                </div>

                <div style={styles.logoutContainer} className="sidebar-logout-container">
                    <button onClick={handleLogout} style={styles.logoutButton} className="sidebar-logout-btn">
                        <svg style={styles.navIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    navSection: { display: 'flex', flexDirection: 'column', gap: '4px' },
    navLabel: { fontSize: '11px', fontWeight: '600', color: '#6e6962', textTransform: 'uppercase', letterSpacing: '0.5px', paddingLeft: '10px', marginBottom: '8px' },
    navItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', color: '#b5b0a6', fontSize: '13px', fontWeight: '500', textDecoration: 'none' },
    navItemActive: { backgroundImage: 'linear-gradient(135deg, #2b2b2b 0%, #222222 100%)', color: '#ede6d8', boxShadow: 'inset 2px 0 0 #b3251e' },
    navIcon: { width: '16px', height: '16px', color: '#b5b0a6', flexShrink: 0 },
    logoutContainer: { paddingTop: '16px', borderTop: '1px solid #2e2e2e' },
    logoutButton: { display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', backgroundColor: 'transparent', border: 'none', borderRadius: '8px', color: '#b3251e', fontSize: '13px', fontWeight: '500', cursor: 'pointer', textAlign: 'left' },
};