import { Link, router } from '@inertiajs/react';

export default function Sidebar({ activePage }) {
    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div style={styles.sidebar}>
            <div>
                {/* Navigation Links */}
                <div style={styles.navSection}>
                    <div style={styles.navLabel}>Menu</div>
                    
                    <Link 
                        href="/home" 
                        style={{
                            ...styles.navItem,
                            ...(activePage === 'home' ? styles.navItemActive : {})
                        }}
                    >
                        <svg style={styles.navIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Home
                    </Link>

                    <Link 
                        href="/profile" 
                        style={{
                            ...styles.navItem,
                            ...(activePage === 'profile' ? styles.navItemActive : {})
                        }}
                    >
                        <svg style={styles.navIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Profile
                    </Link>

                    <Link 
                        href="/settings" 
                        style={{
                            ...styles.navItem,
                            ...(activePage === 'settings' ? styles.navItemActive : {})
                        }}
                    >
                        <svg style={styles.navIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                    </Link>
                </div>
            </div>

            {/* Bottom Log out Button */}
            <div style={styles.logoutContainer}>
                <button onClick={handleLogout} style={styles.logoutButton}>
                    <svg style={styles.navIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Log out
                </button>
            </div>
        </div>
    );
}

const styles = {
    sidebar: {
        width: '240px',
        backgroundColor: '#0d1117',
        borderRight: '1px solid #21262d',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        boxSizing: 'border-box',
        flexShrink: 0,
    },
    navSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    navLabel: {
        fontSize: '11px',
        fontWeight: '600',
        color: '#484f58',
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
        color: '#8b949e',
        fontSize: '13px',
        fontWeight: '500',
        textDecoration: 'none',
        transition: 'all 0.2s',
    },
    navItemActive: {
        backgroundColor: '#21262d',
        color: '#ffffff',
    },
    navIcon: {
        width: '16px',
        height: '16px',
        color: '#8b949e',
    },
    logoutContainer: {
        paddingTop: '16px',
        borderTop: '1px solid #21262d',
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
        color: '#f85149',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        textAlign: 'left',
    },
};