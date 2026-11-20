import { useState, useRef } from 'react';
import { useForm, router } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import Breadcrumb from '@/Components/Breadcrumb';
import Toast from '@/Components/Toast';
import { optimizeImage } from '@/Utils/optimizeImage';

export default function Profile({ auth }) {
    const user = auth?.user || {};
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [avatarError, setAvatarError] = useState('');
    const [isOptimizingAvatar, setIsOptimizingAvatar] = useState(false);
    const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);
    const fileInputRef = useRef(null);

    const { data, setData, patch, processing, errors, reset } = useForm({
        name: user.name || '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || '',
        nationality: user.nationality || '',
        address: user.address || '',
        phone_number: user.phone_number || '',
    });

    const showAvatarFailureToast = (fallbackMessage = 'Something went wrong') => {
        setToastMessage('Something went wrong');
        setAvatarError(fallbackMessage);
    };

    const handleCancel = () => {
        reset();
        setIsEditing(false);
    };

    const handleSave = (e) => {
        e.preventDefault();
        patch('/profile', {
            onSuccess: () => {
                setIsEditing(false);
                setToastMessage('Profile updated successfully!');
            },
            onError: () => {
                setToastMessage('Something went wrong');
            },
            onInvalid: () => {
                setToastMessage('Something went wrong');
            },
        });
    };

    const handleAvatarClick = () => {
        if (!isOptimizingAvatar) fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file || isOptimizingAvatar) return;

        setAvatarError('');
        setIsOptimizingAvatar(true);

        try {
            const optimized = await optimizeImage(file, {
                maxDimension: 640,
                quality: 0.78,
            });

            const formData = new FormData();
            formData.append('avatar', optimized);

            router.post('/profile/avatar', formData, {
                forceFormData: true,
                onSuccess: () => {
                    setToastMessage('Profile picture updated!');
                    setShowViewModal(false);
                },
                onError: (errs) => {
                    showAvatarFailureToast(errs?.avatar || 'Something went wrong');
                },
                onInvalid: () => {
                    showAvatarFailureToast('Something went wrong');
                },
                onFinish: () => {
                    setIsOptimizingAvatar(false);
                },
            });
        } catch (error) {
            showAvatarFailureToast(error?.message || 'Something went wrong');
            setIsOptimizingAvatar(false);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const confirmDeleteAvatar = () => {
        if (isDeletingAvatar) return;
        setAvatarError('');
        setIsDeletingAvatar(true);
        router.delete('/profile/avatar', {
            onSuccess: () => {
                setShowDeleteModal(false);
                setShowViewModal(false);
                setToastMessage('Profile picture removed.');
            },
            onError: (errs) => {
                showAvatarFailureToast(errs?.avatar || 'Something went wrong');
            },
            onInvalid: () => {
                showAvatarFailureToast('Something went wrong');
            },
            onFinish: () => {
                setIsDeletingAvatar(false);
            },
        });
    };

    const avatarUrl = user.avatar
        ? (user.avatar.startsWith('http://') || user.avatar.startsWith('https://') || user.avatar.startsWith('data:')
            ? user.avatar
            : `/storage/${user.avatar}`)
        : null;

    return (
        <div style={styles.page} className="page-layout">
            <style>{`
                @keyframes spinnerRotate {
                    100% { transform: rotate(360deg); }
                }
                @keyframes spinnerDash {
                    0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
                    50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
                    100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
                }
                .avatar-spinner {
                    animation: spinnerRotate 1.4s linear infinite;
                    width: 32px;
                    height: 32px;
                }
                .avatar-spinner-circle {
                    animation: spinnerDash 1.2s ease-in-out infinite;
                    stroke-linecap: round;
                }
                .btn-spinner {
                    animation: spinnerRotate 1.4s linear infinite;
                    width: 16px;
                    height: 16px;
                }
                .btn-spinner-circle {
                    animation: spinnerDash 1.2s ease-in-out infinite;
                    stroke-linecap: round;
                }
                @keyframes cardFadeIn {
                    from { opacity: 0; transform: translateY(16px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animated-card {
                    animation: cardFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .hover-list-row {
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .hover-list-row:hover {
                    background-color: rgba(47, 107, 255, 0.15);
                    padding-left: 6px;
                    padding-right: 6px;
                    border-radius: 6px;
                    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.3);
                }
                .hover-btn {
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .hover-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -2px 0 rgba(0, 0, 0, 0.4), 0 6px 14px rgba(47, 107, 255, 0.35);
                }
                .hover-btn:active {
                    transform: translateY(1px);
                }
                @media (max-width: 768px) {
                    .page-layout {
                        flex-direction: column !important;
                    }
                    .mainContent {
                        padding: 16px 16px 92px 16px !important;
                    }
                }

                input:focus-visible, select:focus-visible, textarea:focus-visible,
                button:focus-visible, a:focus-visible {
                    outline: 2px solid #2F6BFF;
                    outline-offset: 2px;
                }
                input::placeholder, textarea::placeholder {
                    color: #7B8AB8;
                    opacity: 1;
                }
                input:-webkit-autofill,
                input:-webkit-autofill:hover,
                input:-webkit-autofill:focus {
                    -webkit-box-shadow: 0 0 0 1000px #1B2030 inset !important;
                    -webkit-text-fill-color: #FFFFFF !important;
                    caret-color: #FFFFFF;
                }
            `}</style>

            <Sidebar activePage="profile" />

            <div style={styles.mainContent} className="mainContent">
                <Toast message={toastMessage} duration={1000} onClose={() => setToastMessage(null)} />

                <Breadcrumb items={[{ label: 'Main', href: '/home' }, { label: 'My Profile' }]} />

                <div style={styles.contentBody}>
                    <div style={styles.profileHeader} className="animated-card">
                        <div
                            style={styles.avatarContainer}
                            onClick={() => setShowViewModal(true)}
                        >
                            <div style={styles.avatarWrapper}>
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="User Avatar" style={styles.avatar} />
                                ) : (
                                    <div style={styles.blankAvatar}>
                                        <svg style={styles.blankAvatarIcon} fill="#8A99C2" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/jpeg,image/png,image/webp" disabled={isOptimizingAvatar} style={{ display: 'none' }} />
                        </div>

                        {avatarError && <span style={styles.errorText}>{avatarError}</span>}

                        <div style={styles.profileNameRow}>
                            <h2 style={styles.profileName}>{user.name || 'User'}</h2>
                            <svg style={styles.verifiedBadge} viewBox="0 0 24 24" fill="#2F6BFF">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p style={styles.profileEmail}>{user.email || 'name@example.com'}</p>
                    </div>

                    <div style={styles.gridContainer}>
                        <form onSubmit={handleSave} style={styles.cardBox} className="animated-card">
                            <div style={styles.cardHeaderRow}>
                                <h3 style={styles.cardTitle}>Personal details</h3>
                                {!isEditing ? (
                                    <button onClick={() => setIsEditing(true)} style={styles.iconEditBtn} className="hover-btn" title="Edit Details" type="button">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                        </svg>
                                    </button>
                                ) : (
                                    <div style={styles.actionButtonGroup}>
                                        <button type="button" onClick={handleCancel} style={styles.cancelButton} className="hover-btn" disabled={processing}>Cancel</button>
                                        <button type="submit" style={styles.saveButton} className="hover-btn" disabled={processing}>
                                            {processing ? (
                                                <svg viewBox="0 0 50 50" className="btn-spinner" aria-hidden="true">
                                                    <circle
                                                        cx="25" cy="25" r="20"
                                                        fill="none"
                                                        stroke="#FFFFFF"
                                                        strokeWidth="5"
                                                        className="btn-spinner-circle"
                                                    />
                                                </svg>
                                            ) : 'Save Changes'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div style={styles.detailRow} className="hover-list-row">
                                <span style={styles.key}>Full name:</span>
                                {isEditing ? (
                                    <div style={styles.inputWrapper}>
                                        <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} style={styles.input} />
                                        {errors.name && <span style={styles.errorText}>{errors.name}</span>}
                                    </div>
                                ) : (
                                    <span style={styles.value}>{user.name || 'N/A'}</span>
                                )}
                            </div>

                            <div style={styles.detailRow} className="hover-list-row">
                                <span style={styles.key}>Date of Birth:</span>
                                {isEditing ? (
                                    <div style={styles.inputWrapper}>
                                        <input type="text" value={data.date_of_birth} onChange={e => setData('date_of_birth', e.target.value)} placeholder="e.g. January 1, 1987" style={styles.input} />
                                    </div>
                                ) : (
                                    <span style={styles.value}>{user.date_of_birth || 'N/A'}</span>
                                )}
                            </div>

                            <div style={styles.detailRow} className="hover-list-row">
                                <span style={styles.key}>Gender:</span>
                                {isEditing ? (
                                    <div style={styles.inputWrapper}>
                                        <input type="text" value={data.gender} onChange={e => setData('gender', e.target.value)} placeholder="e.g. Male" style={styles.input} />
                                    </div>
                                ) : (
                                    <span style={styles.value}>{user.gender || 'N/A'}</span>
                                )}
                            </div>

                            <div style={styles.detailRow} className="hover-list-row">
                                <span style={styles.key}>Nationality:</span>
                                {isEditing ? (
                                    <div style={styles.inputWrapper}>
                                        <input type="text" value={data.nationality} onChange={e => setData('nationality', e.target.value)} placeholder="e.g. American" style={styles.input} />
                                    </div>
                                ) : (
                                    <span style={styles.value}>{user.nationality || 'N/A'}</span>
                                )}
                            </div>

                            <div style={styles.detailRow} className="hover-list-row">
                                <span style={styles.key}>Address:</span>
                                {isEditing ? (
                                    <div style={styles.inputWrapper}>
                                        <input type="text" value={data.address} onChange={e => setData('address', e.target.value)} placeholder="e.g. California - United States" style={styles.input} />
                                    </div>
                                ) : (
                                    <span style={styles.value}>{user.address || 'N/A'}</span>
                                )}
                            </div>

                            <div style={styles.detailRow} className="hover-list-row">
                                <span style={styles.key}>Phone Number:</span>
                                {isEditing ? (
                                    <div style={styles.inputWrapper}>
                                        <input type="text" value={data.phone_number} onChange={e => setData('phone_number', e.target.value)} placeholder="e.g. (213) 555-1234" style={styles.input} />
                                    </div>
                                ) : (
                                    <span style={styles.value}>{user.phone_number || 'N/A'}</span>
                                )}
                            </div>

                            <div style={styles.detailRow} className="hover-list-row">
                                <span style={styles.key}>Email:</span>
                                <span style={styles.disabledValue}>{user.email || 'N/A'}</span>
                            </div>
                        </form>
                    </div>
                </div>

                {showViewModal && (
                    <div style={styles.modalOverlay} onClick={() => setShowViewModal(false)}>
                        <div style={styles.viewModalBox} onClick={(e) => e.stopPropagation()}>
                            <div style={styles.viewModalHeader}>
                                <h3 style={styles.modalTitle}>Profile Picture</h3>
                                <button onClick={() => setShowViewModal(false)} style={styles.closeModalBtn}>✕</button>
                            </div>
                            <div style={styles.fullImageContainer}>
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Full Profile" style={styles.fullImage} />
                                ) : (
                                    <div style={styles.fullBlankAvatar}>
                                        <svg style={{ width: '96px', height: '96px' }} fill="#8A99C2" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div style={styles.modalActionsRow}>
                                <button onClick={handleAvatarClick} disabled={isOptimizingAvatar} style={styles.uploadIconBtn} className="hover-btn" title="Upload New Picture" type="button">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="17 8 12 3 7 8"></polyline>
                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                    </svg>
                                    Upload Photo
                                </button>
                                {user.avatar && (
                                    <button onClick={() => setShowDeleteModal(true)} style={styles.deleteIconBtn} className="hover-btn" title="Remove Profile Picture" type="button">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {isOptimizingAvatar && (
                    <div style={styles.progressModalOverlay} role="status" aria-label="Uploading file">
                        <div style={styles.progressModalBox}>
                            <svg viewBox="0 0 50 50" style={styles.avatarSpinnerSvg} className="avatar-spinner" aria-hidden="true">
                                <circle
                                    cx="25" cy="25" r="20"
                                    fill="none"
                                    stroke="#2F6BFF"
                                    strokeWidth="4"
                                    className="avatar-spinner-circle"
                                />
                            </svg>
                            <h4 style={styles.progressText}>Uploading...</h4>
                        </div>
                    </div>
                )}

                {showDeleteModal && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modalBox}>
                            <h3 style={styles.modalTitle}>Delete Avatar</h3>
                            <p style={styles.modalText}>Are you sure you want to delete your profile picture? This action cannot be undone.</p>
                            <div style={styles.modalActions}>
                                <button onClick={() => setShowDeleteModal(false)} style={styles.modalCancelBtn} className="hover-btn" type="button" disabled={isDeletingAvatar}>Cancel</button>
                                <button onClick={confirmDeleteAvatar} style={styles.modalDeleteBtn} className="hover-btn" type="button" disabled={isDeletingAvatar}>
                                    {isDeletingAvatar ? (
                                        <svg viewBox="0 0 50 50" className="btn-spinner" aria-hidden="true">
                                            <circle
                                                cx="25" cy="25" r="20"
                                                fill="none"
                                                stroke="#FFA11A"
                                                strokeWidth="5"
                                                className="btn-spinner-circle"
                                            />
                                        </svg>
                                    ) : 'Yes, Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    page: {
        height: '100vh', width: '100vw',
        backgroundColor: '#090A10', display: 'flex', flexDirection: 'row',
        margin: 0, padding: 0, boxSizing: 'border-box', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
    },
    mainContent: { flex: 1, backgroundColor: '#090A10', height: '100vh', overflowY: 'auto', padding: '24px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' },
    contentBody: { display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '750px', margin: '0 auto' },
    iconEditBtn: {
        backgroundColor: '#1B2030', color: '#FFFFFF', border: '1px solid #252D45', width: '30px', height: '30px',
        borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
    },
    profileHeader: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px', width: '100%' },
    avatarContainer: { position: 'relative', marginBottom: '24px', cursor: 'pointer', width: '76px', height: '76px' },
    avatarSpinnerSvg: { width: '32px', height: '32px', filter: 'drop-shadow(0 0 4px rgba(0, 0, 0, 0.2))' },
    avatarWrapper: { width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '2px solid #252D45', backgroundColor: '#1B2030', position: 'relative', boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.5), 0 4px 10px rgba(0, 0, 0, 0.4)' },
    avatar: { width: '100%', height: '100%', objectFit: 'cover' },
    blankAvatar: { width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1B2030' },
    blankAvatarIcon: { width: '44px', height: '44px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px' },
    viewModalBox: { backgroundColor: '#131722', border: '1px solid #252D45', borderRadius: '12px', padding: '20px', width: '100%', maxWidth: '400px', boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 -2px 0 rgba(0, 0, 0, 0.6), 0 20px 40px rgba(0, 0, 0, 0.8), 0 4px 8px rgba(0, 0, 0, 0.4)', boxSizing: 'border-box' },
    viewModalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    closeModalBtn: { background: 'none', border: 'none', color: '#8A99C2', fontSize: '16px', cursor: 'pointer' },
    fullImageContainer: { width: '100%', height: '320px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1B2030', borderRadius: '8px', overflow: 'hidden', border: '1px solid #252D45', boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.4)', marginBottom: '16px' },
    fullImage: { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' },
    fullBlankAvatar: { width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1B2030' },
    modalActionsRow: { display: 'flex', justifyContent: 'center', gap: '10px' },
    uploadIconBtn: { backgroundColor: '#2F6BFF', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 4px 10px rgba(47, 107, 255, 0.3)' },
    deleteIconBtn: { backgroundColor: 'rgba(255, 161, 26, 0.2)', color: '#FFA11A', border: '1px solid rgba(255, 161, 26, 0.5)', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)' },
    progressModalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.82)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '16px' },
    progressModalBox: { backgroundColor: '#131722', border: '1px solid #252D45', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 -2px 0 rgba(0, 0, 0, 0.6), 0 20px 40px rgba(0, 0, 0, 0.8), 0 4px 8px rgba(0, 0, 0, 0.4)' },
    progressText: { fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: 0 },
    modalBox: { backgroundColor: '#131722', border: '1px solid #252D45', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '380px', boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 -2px 0 rgba(0, 0, 0, 0.6), 0 20px 40px rgba(0, 0, 0, 0.8), 0 4px 8px rgba(0, 0, 0, 0.4)', textAlign: 'center', boxSizing: 'border-box', zIndex: 1050 },
    modalTitle: { fontSize: '16px', fontWeight: '600', color: '#FFFFFF', margin: 0 },
    modalText: { fontSize: '13px', color: '#8A99C2', margin: '0 0 20px 0', lineHeight: '1.4' },
    modalActions: { display: 'flex', justifyContent: 'center', gap: '10px' },
    modalCancelBtn: { backgroundColor: '#1B2030', color: '#FFFFFF', border: '1px solid #252D45', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)' },
    modalDeleteBtn: { backgroundColor: 'rgba(255, 161, 26, 0.2)', color: '#FFA11A', border: '1px solid rgba(255, 161, 26, 0.5)', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '85px', minHeight: '26px', boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)' },
    profileNameRow: { display: 'flex', alignItems: 'center', gap: '6px' },
    profileName: { fontSize: '18px', fontWeight: '600', color: '#FFFFFF', margin: 0 },
    verifiedBadge: { width: '16px', height: '16px' },
    profileEmail: { fontSize: '13px', color: '#8A99C2', margin: '4px 0 0 0' },
    gridContainer: { display: 'flex', justifyContent: 'center', paddingBottom: '20px', width: '100%' },
    cardBox: { width: '100%', maxWidth: '750px', backgroundColor: '#131722', borderRadius: '12px', border: '1px solid #252D45', padding: '20px', boxSizing: 'border-box', boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.5), 0 6px 16px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3)' },
    cardHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    cardTitle: { fontSize: '14px', fontWeight: '600', color: '#FFFFFF', margin: 0 },
    actionButtonGroup: { display: 'flex', gap: '8px' },
    cancelButton: { backgroundColor: '#1B2030', color: '#FFFFFF', border: '1px solid #252D45', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)' },
    saveButton: { backgroundColor: '#2F6BFF', color: '#FFFFFF', border: 'none', padding: '4px 20px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '26px', boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -2px 0 rgba(0, 0, 0, 0.4), 0 4px 10px rgba(47, 107, 255, 0.3)' },
    detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '8px 0', borderBottom: '1px solid #252D45', gap: '12px' },
    key: { color: '#8A99C2', flexBasis: '35%', flexShrink: 0 },
    value: { color: '#FFFFFF', fontWeight: '500', flexBasis: '65%', textAlign: 'right', overflowWrap: 'anywhere' },
    disabledValue: { color: '#2F6BFF', fontWeight: '500', flexBasis: '65%', textAlign: 'right', overflowWrap: 'anywhere' },
    inputWrapper: { flexBasis: '65%', display: 'flex', flexDirection: 'column' },
    input: { width: '100%', backgroundColor: '#1B2030', border: '1px solid #252D45', borderRadius: '6px', padding: '6px 10px', color: '#FFFFFF', fontSize: '12px', outline: 'none', boxSizing: 'border-box', boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)' },
    errorText: { color: '#FFA11A', fontSize: '11px', marginTop: '4px', textAlign: 'center' },
};