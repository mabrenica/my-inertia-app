import { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';

export default function CreateAccount() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/create-account');
    };

    return (
        <div style={styles.page}>
            {/* Autofill Fix Injection */}
            <style>{`
                input:-webkit-autofill,
                input:-webkit-autofill:hover,
                input:-webkit-autofill:focus,
                input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 30px #0d1117 inset !important;
                    -webkit-text-fill-color: #ffffff !important;
                    transition: background-color 5000s ease-in-out 0s;
                }
            `}</style>

            <div style={styles.cardContainer}>
                {/* Left Side - Form Section */}
                <div style={styles.formSection}>
                    <div style={styles.contentGroup}>
                        <h1 style={styles.title}>Create account</h1>
                        <p style={styles.subtitle}>
                            Already have an account? <Link href="/" style={styles.link}>Sign in</Link>
                        </p>

                        <form onSubmit={handleSubmit} style={styles.form}>
                            {/* Name Input */}
                            <div style={styles.inputContainer}>
                                <label style={styles.label}>Full Name</label>
                                <div style={{
                                    ...styles.inputWrapper,
                                    borderColor: errors.name ? '#ef4444' : 'transparent'
                                }}>
                                    <input 
                                        type="text" 
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        placeholder="John Doe"
                                        style={styles.input}
                                        required
                                    />
                                    <svg style={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                {errors.name && <span style={styles.errorText}>{errors.name}</span>}
                            </div>

                            {/* Email Input */}
                            <div style={styles.inputContainer}>
                                <label style={styles.label}>Email</label>
                                <div style={{
                                    ...styles.inputWrapper,
                                    borderColor: errors.email ? '#ef4444' : 'transparent'
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

                            {/* Password Input */}
                            <div style={styles.inputContainer}>
                                <label style={styles.label}>Password</label>
                                <div style={{
                                    ...styles.inputWrapper,
                                    borderColor: errors.password ? '#ef4444' : '#1f6feb'
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

                            {/* Confirm Password Input */}
                            <div style={styles.inputContainer}>
                                <label style={styles.label}>Confirm Password</label>
                                <div style={{
                                    ...styles.inputWrapper,
                                    borderColor: errors.password_confirmation ? '#ef4444' : 'transparent'
                                }}>
                                    <input 
                                        type={showConfirmPassword ? 'text' : 'password'} 
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        placeholder="••••••••"
                                        style={styles.input}
                                        required
                                    />
                                    <svg 
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={styles.eyeIcon} 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor"
                                    >
                                        {showConfirmPassword ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 012.016-3.34m4.85-2.502A9.957 9.957 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                                        )}
                                    </svg>
                                </div>
                                {errors.password_confirmation && <span style={styles.errorText}>{errors.password_confirmation}</span>}
                            </div>

                            {/* Submit Button */}
                            <div style={styles.buttonGroup}>
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    style={{
                                        ...styles.primaryButton,
                                        opacity: processing ? 0.7 : 1
                                    }}
                                >
                                    {processing ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Side - Automotive Background Image with Minimalist Logo Overlay */}
                <div style={styles.imageSection}>
                    <div style={styles.overlay} />
                    <div style={styles.logoBadge}>
                        <div style={styles.logoIcon}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#12161f',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
    },
    cardContainer: {
        width: '100%',
        maxWidth: '1100px',
        minHeight: '680px',
        backgroundColor: '#161b22',
        borderRadius: '20px',
        display: 'flex',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        border: '1px solid #21262d',
    },
    formSection: {
        flex: '1.1',
        padding: '32px 48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: '#161b22',
        overflowY: 'auto',
        maxHeight: '680px',
    },
    contentGroup: {
        maxWidth: '420px',
        margin: '0 auto',
        width: '100%',
    },
    title: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#ffffff',
        margin: '0 0 8px 0',
        letterSpacing: '-0.5px',
    },
    subtitle: {
        color: '#8b949e',
        fontSize: '13px',
        margin: '0 0 24px 0',
    },
    link: {
        color: '#3b82f6',
        textDecoration: 'none',
        fontWeight: '500',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
    },
    inputContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    label: {
        fontSize: '11px',
        color: '#8b949e',
        marginLeft: '4px',
        fontWeight: '500',
    },
    inputWrapper: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#0d1117',
        borderRadius: '8px',
        padding: '9px 14px',
        border: '1px solid #30363d',
        transition: 'border-color 0.2s ease',
    },
    input: {
        width: '100%',
        backgroundColor: 'transparent',
        border: 'none',
        outline: 'none',
        color: '#ffffff',
        fontSize: '13px',
    },
    icon: {
        width: '16px',
        height: '16px',
        color: '#8b949e',
        marginLeft: '10px',
        flexShrink: 0,
    },
    eyeIcon: {
        width: '16px',
        height: '16px',
        color: '#8b949e',
        marginLeft: '10px',
        flexShrink: 0,
        cursor: 'pointer',
    },
    errorText: {
        fontSize: '11px',
        color: '#f85149',
        marginTop: '2px',
        marginLeft: '4px',
    },
    buttonGroup: {
        display: 'flex',
        marginTop: '8px',
    },
    primaryButton: {
        width: '100%',
        padding: '12px 20px',
        backgroundColor: '#1f6feb',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '13px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
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
        backgroundColor: 'rgba(13, 17, 23, 0.2)',
    },
    logoBadge: {
        position: 'relative',
        zIndex: 2,
        backgroundColor: 'rgba(13, 17, 23, 0.75)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '8px 16px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
    },
    logoIcon: {
        width: '28px',
        height: '28px',
        backgroundColor: '#1f6feb22',
        border: '1px solid #1f6feb44',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: '600',
        letterSpacing: '-0.2px',
    },
};