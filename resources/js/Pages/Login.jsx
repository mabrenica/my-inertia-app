import { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [emptyRequiredFields, setEmptyRequiredFields] = useState({});
    const [shakeKey, setShakeKey] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const clearRequiredError = (field) => {
        setEmptyRequiredFields((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const missing = {};
        if (!data.email.trim()) missing.email = true;
        if (!data.password.trim()) missing.password = true;

        setEmptyRequiredFields(missing);
        if (Object.keys(missing).length > 0) {
            setShakeKey((k) => k + 1);
            return;
        }

        post('/login');
    };

    const isFieldInvalid = (field) => Boolean(emptyRequiredFields[field] || errors[field]);

    return (
        <div style={styles.page}>
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
                    width: 24px;
                    height: 24px;
                }
                .btn-spinner-circle {
                    animation: spinnerDash 1.2s ease-in-out infinite;
                    stroke-linecap: round;
                }
                @keyframes cardFadeIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes fadeInOverlay {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUpModal {
                    from { opacity: 0; transform: translateY(14px) scale(0.96); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes fieldShake {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-5px); }
                    40% { transform: translateX(5px); }
                    60% { transform: translateX(-4px); }
                    80% { transform: translateX(4px); }
                }
                .animated-card {
                    animation: cardFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animated-overlay {
                    animation: fadeInOverlay 0.2s ease-out forwards;
                }
                .animated-modal {
                    animation: slideUpModal 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .shake-invalid {
                    animation: fieldShake 0.36s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
                }
                .hover-btn {
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .hover-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.45), 0 0 18px rgba(233, 197, 228, 0.34);
                }
                .hover-btn:active {
                    transform: translateY(1px);
                }
                .auth-form-section input::placeholder {
                    color: #ABA8B4;
                }
                .auth-form-section input:-webkit-autofill,
                .auth-form-section input:-webkit-autofill:hover,
                .auth-form-section input:-webkit-autofill:focus {
                    -webkit-box-shadow: 0 0 0 1000px #292831 inset !important;
                    -webkit-text-fill-color: #FFF8F0 !important;
                    caret-color: #FFF8F0;
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

                        <form onSubmit={handleSubmit} style={styles.form} noValidate>
                            <div style={styles.inputContainer}>
                                <label style={styles.label}>Email</label>
                                <div
                                    key={emptyRequiredFields.email ? `email-${shakeKey}` : 'email'}
                                    className={emptyRequiredFields.email ? 'shake-invalid' : ''}
                                    style={{
                                        ...styles.inputWrapper,
                                        borderColor: isFieldInvalid('email') ? '#FF8F9A' : '#50545D'
                                    }}
                                >
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => {
                                            setData('email', e.target.value);
                                            if (e.target.value.trim()) clearRequiredError('email');
                                        }}
                                        placeholder="name@example.com"
                                        style={styles.input}
                                    />
                                    <svg style={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <rect x="3.5" y="5.5" width="17" height="13" rx="2" ry="2" strokeWidth="1.8" />
                                        <path d="M4.5 7l7.5 6 7.5-6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                {errors.email && <span style={styles.errorText}>{errors.email}</span>}
                            </div>

                            <div style={styles.inputContainer}>
                                <label style={styles.label}>Password</label>
                                <div
                                    key={emptyRequiredFields.password ? `password-${shakeKey}` : 'password'}
                                    className={emptyRequiredFields.password ? 'shake-invalid' : ''}
                                    style={{
                                        ...styles.inputWrapper,
                                        borderColor: isFieldInvalid('password') ? '#FF8F9A' : '#50545D'
                                    }}
                                >
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={e => {
                                            setData('password', e.target.value);
                                            if (e.target.value.trim()) clearRequiredError('password');
                                        }}
                                        placeholder="••••••••"
                                        style={styles.input}
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
                                    style={styles.primaryButton}
                                >
                                    Sign In
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div style={styles.imageSection} className="auth-image-section">
                    <div style={styles.overlay} />
                    <div style={styles.logoBadge}>
                        <div style={styles.logoIcon}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFF8F0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="9"></circle>
                                <path d="M12 3v9l5.5 5.5"></path>
                            </svg>
                        </div>
                        <span style={styles.logoText}>FleetFlow</span>
                    </div>
                </div>
            </div>

            {processing && (
                <div style={styles.modalOverlay} className="animated-overlay">
                    <div style={styles.modalBox} className="animated-modal">
                        <svg viewBox="0 0 50 50" className="btn-spinner" aria-hidden="true">
                            <circle
                                cx="25" cy="25" r="20"
                                fill="none"
                                stroke="#E9C5E4"
                                strokeWidth="5"
                                className="btn-spinner-circle"
                            />
                        </svg>
                        <span style={styles.modalText}>Logging In</span>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    page: {
        height: '100vh',
        width: '100vw',
        backgroundColor: '#110D08',
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
        backgroundColor: '#1D1A1B',
        borderRadius: '20px',
        display: 'flex',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.55), 0 0 28px rgba(233, 197, 228, 0.20)',
        border: '1px solid #50545D',
    },
    formSection: {
        flex: '1.1',
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: '#1D1A1B',
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
        color: '#FFF8F0',
        margin: '0 0 8px 0',
        letterSpacing: '-0.5px',
        textShadow: '0 0 18px rgba(233, 197, 228, 0.22)',
    },
    subtitle: {
        color: '#C9C3CC',
        fontSize: '13px',
        margin: '0 0 32px 0',
    },
    link: {
        color: '#FFF8F0',
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
        color: '#C9C3CC',
        marginLeft: '4px',
        fontWeight: '500',
    },
    inputWrapper: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#292831',
        borderRadius: '8px',
        padding: '10px 14px',
        border: '1px solid #50545D',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow: '0 6px 18px rgba(0,0,0,0.25), 0 0 12px rgba(233, 197, 228, 0.16)',
    },
    input: {
        width: '100%',
        backgroundColor: 'transparent',
        border: 'none',
        outline: 'none',
        color: '#FFF8F0',
        fontSize: '13px',
    },
    icon: {
        width: '16px',
        height: '16px',
        color: '#C9C3CC',
        marginLeft: '10px',
        flexShrink: 0,
    },
    eyeIcon: {
        width: '16px',
        height: '16px',
        color: '#C9C3CC',
        marginLeft: '10px',
        flexShrink: 0,
        cursor: 'pointer',
    },
    errorText: {
        fontSize: '11px',
        color: '#FF8F9A',
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
        backgroundColor: '#E9C5E4',
        color: '#110D08',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '700',
        fontSize: '13px',
        cursor: 'pointer',
        boxShadow: '0 10px 24px rgba(0,0,0,0.34), 0 0 16px rgba(233, 197, 228, 0.26)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '41px',
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
        backgroundColor: 'rgba(17, 13, 8, 0.62)',
    },
    logoBadge: {
        position: 'relative',
        zIndex: 2,
        backgroundColor: 'rgba(29, 26, 27, 0.94)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 248, 240, 0.1)',
        padding: '8px 16px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.3), 0 0 16px rgba(233, 197, 228, 0.20)',
    },
    logoIcon: {
        width: '28px',
        height: '28px',
        backgroundColor: 'rgba(233, 197, 228, 0.18)',
        border: '1px solid rgba(233, 197, 228, 0.55)',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        color: '#FFF8F0',
        fontSize: '14px',
        fontWeight: '600',
        letterSpacing: '-0.2px',
    },
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
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.35), 0 0 20px rgba(233, 197, 228, 0.18)',
        boxSizing: 'border-box',
    },
    modalText: {
        color: '#FFF8F0',
        fontSize: '14px',
        fontWeight: '600',
        letterSpacing: '-0.2px',
    },
};