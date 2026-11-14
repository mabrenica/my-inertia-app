import { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div style={styles.page}>
            <style>{`
                @keyframes cardFadeIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animated-card {
                    animation: cardFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .hover-btn {
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .hover-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(28, 28, 28, 0.15);
                }
                .hover-btn:active {
                    transform: translateY(1px);
                }
                @media (max-width: 768px) {
                    .auth-card-container {
                        flex-direction: column-reverse !important;
                        max-width: 100% !important;
                        min-height: auto !important;
                        border-radius: 12px !important;
                    }
                    .auth-image-section {
                        display: none !important;
                    }
                    .auth-form-section {
                        padding: 24px !important;
                    }
                }
            `}</style>

            <div style={styles.cardContainer} className="animated-card auth-card-container">
                <div style={styles.formSection} className="auth-form-section">
                    <div style={styles.contentGroup}>
                        <h1 style={styles.title}>Sign in</h1>
                        <p style={styles.subtitle}>
                            Don't have an account? <Link href="/create-account" style={styles.link}>Create an account</Link>
                        </p>

                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.inputContainer}>
                                <label style={styles.label}>Email</label>
                                <div style={{
                                    ...styles.inputWrapper,
                                    borderColor: errors.email ? '#b3251e' : '#d6ccbb'
                                }}>
                                    <input 
                                        type="email" 
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        placeholder="name@example.com"
                                        style={styles.input}
                                        required
                                    />
                                    <svg style={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                {errors.email && <span style={styles.errorText}>{errors.email}</span>}
                            </div>

                            <div style={styles.inputContainer}>
                                <label style={styles.label}>Password</label>
                                <div style={{
                                    ...styles.inputWrapper,
                                    borderColor: errors.password ? '#b3251e' : '#d6ccbb'
                                }}>
                                    <input 
                                        type={showPassword ? 'text' : 'password'} 
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        style={styles.input}
                                        required
                                    />
                                    <svg 
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={styles.eyeIcon} 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor"
                                    >
                                        {showPassword ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 012.016-3.34m4.85-2.502A9.957 9.957 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                                        )}
                                    </svg>
                                </div>
                                {errors.password && <span style={styles.errorText}>{errors.password}</span>}
                            </div>

                            <div style={styles.buttonGroup}>
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="hover-btn"
                                    style={{
                                        ...styles.primaryButton,
                                        opacity: processing ? 0.7 : 1
                                    }}
                                >
                                    {processing ? 'Signing In...' : 'Sign In'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div style={styles.imageSection} className="auth-image-section">
                    <div style={styles.overlay} />
                    <div style={styles.logoBadge}>
                        <div style={styles.logoIcon}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b3251e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="9"></circle>
                                <path d="M12 3v9l5.5 5.5"></path>
                            </svg>
                        </div>
                        <span style={styles.logoText}>FleetFlow</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: {
        height: '100vh',
        width: '100vw',
        backgroundColor: '#ede6d8',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px',
        boxSizing: 'border-box',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
    },
    cardContainer: {
        width: '100%',
        maxWidth: '1100px',
        minHeight: '680px',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        display: 'flex',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(28, 28, 28, 0.1)',
        border: '1px solid #d6ccbb',
    },
    formSection: {
        flex: '1.1',
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
    },
    contentGroup: {
        maxWidth: '420px',
        margin: '0 auto',
        width: '100%',
    },
    title: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#1c1c1c',
        margin: '0 0 8px 0',
        letterSpacing: '-0.5px',
    },
    subtitle: {
        color: '#6e6962',
        fontSize: '13px',
        margin: '0 0 32px 0',
    },
    link: {
        color: '#b3251e',
        textDecoration: 'none',
        fontWeight: '600',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    inputContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        fontSize: '11px',
        color: '#6e6962',
        marginLeft: '4px',
        fontWeight: '500',
    },
    inputWrapper: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#ede6d8',
        borderRadius: '8px',
        padding: '10px 14px',
        border: '1px solid #d6ccbb',
        transition: 'border-color 0.2s ease',
    },
    input: {
        width: '100%',
        backgroundColor: 'transparent',
        border: 'none',
        outline: 'none',
        color: '#1c1c1c',
        fontSize: '13px',
    },
    icon: {
        width: '16px',
        height: '16px',
        color: '#6e6962',
        marginLeft: '10px',
        flexShrink: 0,
    },
    eyeIcon: {
        width: '16px',
        height: '16px',
        color: '#6e6962',
        marginLeft: '10px',
        flexShrink: 0,
        cursor: 'pointer',
    },
    errorText: {
        fontSize: '11px',
        color: '#b3251e',
        marginTop: '2px',
        marginLeft: '4px',
    },
    buttonGroup: {
        display: 'flex',
        marginTop: '12px',
    },
    primaryButton: {
        width: '100%',
        padding: '12px 20px',
        backgroundColor: '#1c1c1c',
        color: '#ede6d8',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '700',
        fontSize: '13px',
        cursor: 'pointer',
    },
    imageSection: {
        flex: '1.2',
        backgroundImage: 'url("https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        padding: '30px',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(28, 28, 28, 0.35)',
    },
    logoBadge: {
        position: 'relative',
        zIndex: 2,
        backgroundColor: 'rgba(28, 28, 28, 0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '8px 16px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
    },
    logoIcon: {
        width: '28px',
        height: '28px',
        backgroundColor: '#b3251e22',
        border: '1px solid #b3251e44',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        color: '#ede6d8',
        fontSize: '14px',
        fontWeight: '600',
        letterSpacing: '-0.2px',
    },
};