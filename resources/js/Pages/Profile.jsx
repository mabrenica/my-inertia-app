import { useState, useRef } from 'react';
import { useForm, router } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import Breadcrumb from '@/Components/Breadcrumb';
import Toast from '@/Components/Toast';

export default function Profile({ auth }) {
    const user = auth?.user || {};
    const [isEditing, setIsEditing] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [avatarError, setAvatarError] = useState('');
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
        });
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarError('');

            if (!file.type.startsWith('image/')) {
                setAvatarError('Please select a valid image file.');
                return;
            }

            const maxSizeInBytes = 2100 * 1024;
            if (file.size > maxSizeInBytes) {
                setAvatarError('Image size must be under 2100 KB.');
                return;
            }

            const formData = new FormData();
            formData.append('avatar', file);

            router.post('/profile/avatar', formData, {
                forceFormData: true,
                onSuccess: () => {
                    setIsHovered(false);
                    setToastMessage('Profile picture updated!');
                },
            });
        }
    };

    const confirmDeleteAvatar = () => {
        router.delete('/profile/avatar', {
            onSuccess: () => {
                setShowDeleteModal(false);
                setIsHovered(false);
                setToastMessage('Profile picture removed.');
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
                    background-color: rgba(233, 197, 228, 0.16);
                    padding-left: 6px;
                    padding-right: 6px;
                    border-radius: 6px;
                }
                .hover-btn {
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .hover-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12), 0 0 14px rgba(233, 197, 228, 0.14);
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

                /* Carbon / Toffee dark theme: accessible fields and soft focus glow */
                input:focus-visible, select:focus-visible, textarea:focus-visible,
                button:focus-visible, a:focus-visible {
                    outline: 2px solid #E9C5E4;
                    outline-offset: 2px;
                }
                input::placeholder, textarea::placeholder {
                    color: #ABA8B4;
                    opacity: 1;
                }
                input:-webkit-autofill,
                input:-webkit-autofill:hover,
                input:-webkit-autofill:focus {
                    -webkit-box-shadow: 0 0 0 1000px #292831 inset !important;
                    -webkit-text-fill-color: #FFF8F0 !important;
                    caret-color: #FFF8F0;
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
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            <div style={styles.avatarWrapper}>
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="User Avatar" style={styles.avatar} />
                                ) : (
                                    <div style={styles.blankAvatar}>
                                        <svg style={styles.blankAvatarIcon} fill="#C9C3CC" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <div style={{
                                ...styles.hoverOverlay,
                                opacity: isHovered ? 1 : 0,
                                visibility: isHovered ? 'visible' : 'hidden',
                            }}>
                                <div style={styles.bottomActionRow}>
                                    {avatarUrl && (
                                        <button onClick={() => setShowViewModal(true)} style={styles.iconBtn} className="hover-btn" title="View Profile Picture" type="button">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                <circle cx="12" cy="12" r="3"></circle>
                                            </svg>
                                        </button>
                                    )}
                                    <button onClick={handleAvatarClick} style={styles.iconBtnUpload} className="hover-btn" title="Upload Avatar" type="button">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="17 8 12 3 7 8"></polyline>
                                            <line x1="12" y1="3" x2="12" y2="15"></line>
                                        </svg>
                                    </button>
                                    {user.avatar && (
                                        <button onClick={() => setShowDeleteModal(true)} style={styles.iconBtnDelete} className="hover-btn" title="Delete Avatar" type="button">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" style={{ display: 'none' }} />
                        </div>

                        {avatarError && <span style={styles.errorText}>{avatarError}</span>}

                        <div style={styles.profileNameRow}>
                            <h2 style={styles.profileName}>{user.name || 'User'}</h2>
                            <svg style={styles.verifiedBadge} viewBox="0 0 24 24" fill="#EDF2B2">
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
                                        <button type="submit" style={styles.saveButton} className="hover-btn" disabled={processing}>{processing ? 'Saving...' : 'Save Changes'}</button>
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
                                        <svg style={{ width: '96px', height: '96px' }} fill="#C9C3CC" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {showDeleteModal && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modalBox}>
                            <h3 style={styles.modalTitle}>Delete Avatar</h3>
                            <p style={styles.modalText}>Are you sure you want to delete your profile picture? This action cannot be undone.</p>
                            <div style={styles.modalActions}>
                                <button onClick={() => setShowDeleteModal(false)} style={styles.modalCancelBtn} className="hover-btn" type="button">Cancel</button>
                                <button onClick={confirmDeleteAvatar} style={styles.modalDeleteBtn} className="hover-btn" type="button">Yes, Delete</button>
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
        backgroundColor: '#110D08', display: 'flex', flexDirection: 'row',
        margin: 0, padding: 0, boxSizing: 'border-box', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
    },
    mainContent: { flex: 1, backgroundColor: '#110D08', height: '100vh', overflowY: 'auto', padding: '24px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' },
    contentBody: { display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '750px', margin: '0 auto' },
    iconEditBtn: {
        backgroundColor: '#292831', color: '#FFF8F0', border: '1px solid #50545D', width: '30px', height: '30px',
        borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    },
    profileHeader: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px', width: '100%' },
    avatarContainer: { position: 'relative', marginBottom: '12px', cursor: 'pointer', width: '76px', height: '76px', borderRadius: '50%' },
    avatarWrapper: { width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '2px solid #50545D', backgroundColor: '#50545D' },
    avatar: { width: '100%', height: '100%', objectFit: 'cover' },
    blankAvatar: { width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#292831' },
    blankAvatarIcon: { width: '44px', height: '44px' },
    hoverOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '50%',
        backgroundColor: 'transparent', display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        zIndex: 10, paddingBottom: '6px', transition: 'opacity 0.25s ease-in-out, visibility 0.25s ease-in-out',
    },
    bottomActionRow: { display: 'flex', gap: '4px' },
    iconBtn: { backgroundColor: '#E9C5E4', color: '#110D08', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 0 16px rgba(233, 197, 228, 0.14)' },
    iconBtnUpload: { backgroundColor: '#E9C5E4', color: '#110D08', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 0 16px rgba(233, 197, 228, 0.14)' },
    iconBtnDelete: { backgroundColor: '#FF8F9A', color: '#FFF8F0', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 0 16px rgba(233, 197, 228, 0.14)' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.70)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px' },
    viewModalBox: { backgroundColor: '#1D1A1B', border: '1px solid #50545D', borderRadius: '12px', padding: '20px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2), 0 0 16px rgba(233, 197, 228, 0.14)', boxSizing: 'border-box' },
    viewModalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    closeModalBtn: { background: 'none', border: 'none', color: '#C9C3CC', fontSize: '16px', cursor: 'pointer' },
    fullImageContainer: { width: '100%', height: '320px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#292831', borderRadius: '8px', overflow: 'hidden', border: '1px solid #50545D' },
    fullImage: { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' },
    fullBlankAvatar: { width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#292831' },
    modalBox: { backgroundColor: '#1D1A1B', border: '1px solid #50545D', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '380px', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2), 0 0 16px rgba(233, 197, 228, 0.14)', textAlign: 'center', boxSizing: 'border-box' },
    modalTitle: { fontSize: '16px', fontWeight: '600', color: '#FFF8F0', margin: 0 },
    modalText: { fontSize: '13px', color: '#C9C3CC', margin: '0 0 20px 0', lineHeight: '1.4' },
    modalActions: { display: 'flex', justifyContent: 'center', gap: '10px' },
    modalCancelBtn: { backgroundColor: 'transparent', color: '#C9C3CC', border: '1px solid #50545D', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
    modalDeleteBtn: { backgroundColor: '#FF8F9A', color: '#FFF8F0', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
    profileNameRow: { display: 'flex', alignItems: 'center', gap: '6px' },
    profileName: { fontSize: '18px', fontWeight: '600', color: '#FFF8F0', margin: 0 },
    verifiedBadge: { width: '16px', height: '16px' },
    profileEmail: { fontSize: '13px', color: '#C9C3CC', margin: '4px 0 0 0' },
    gridContainer: { display: 'flex', justifyContent: 'center', paddingBottom: '20px', width: '100%' },
    cardBox: { width: '100%', maxWidth: '750px', backgroundColor: '#1D1A1B', borderRadius: '12px', border: '1px solid #50545D', padding: '20px', boxSizing: 'border-box', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04), 0 0 16px rgba(233, 197, 228, 0.14)' },
    cardHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    cardTitle: { fontSize: '14px', fontWeight: '600', color: '#FFF8F0', margin: 0 },
    actionButtonGroup: { display: 'flex', gap: '8px' },
    cancelButton: { backgroundColor: 'transparent', color: '#C9C3CC', border: '1px solid #50545D', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
    saveButton: { backgroundColor: '#E9C5E4', color: '#110D08', border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
    detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '8px 0', borderBottom: '1px solid #50545D', gap: '12px' },
    key: { color: '#C9C3CC', flexBasis: '35%', flexShrink: 0 },
    value: { color: '#FFF8F0', fontWeight: '500', flexBasis: '65%', textAlign: 'right', overflowWrap: 'anywhere' },
    disabledValue: { color: '#E9C5E4', fontWeight: '500', flexBasis: '65%', textAlign: 'right', overflowWrap: 'anywhere' },
    inputWrapper: { flexBasis: '65%', display: 'flex', flexDirection: 'column' },
    input: { width: '100%', backgroundColor: '#292831', border: '1px solid #50545D', borderRadius: '6px', padding: '6px 10px', color: '#FFF8F0', fontSize: '12px', outline: 'none', boxSizing: 'border-box' },
    errorText: { color: '#FF8F9A', fontSize: '11px', marginTop: '4px', textAlign: 'center' },
};