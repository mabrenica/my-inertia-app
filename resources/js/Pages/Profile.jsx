import { useState, useRef } from 'react';
import { useForm, router } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import Breadcrumb from '@/Components/Breadcrumb';

export default function Profile({ auth }) {
    const user = auth?.user || {};
    const [isEditing, setIsEditing] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [avatarError, setAvatarError] = useState('');
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
            onSuccess: () => setIsEditing(false),
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
                onSuccess: () => setIsHovered(false),
            });
        }
    };

    const confirmDeleteAvatar = () => {
        router.delete('/profile/avatar', {
            onSuccess: () => {
                setShowDeleteModal(false);
                setIsHovered(false);
            },
        });
    };

    const avatarUrl = user.avatar ? `/storage/${user.avatar}` : null;

    return (
        <div style={styles.page}>
            <div style={styles.appWindow}>
                <Sidebar activePage="profile" />

                <div style={styles.mainContent}>
                    <Breadcrumb items={[{ label: 'Main', href: '/home' }, { label: 'My Profile' }]} />

                    <div style={styles.contentBody}>
                        <div style={styles.profileHeader}>
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
                                            <svg style={styles.blankAvatarIcon} fill="#8b949e" viewBox="0 0 24 24">
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
                                            <button onClick={() => setShowViewModal(true)} style={styles.iconBtn} title="View Profile Picture" type="button">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                            </button>
                                        )}
                                        <button onClick={handleAvatarClick} style={styles.iconBtnUpload} title="Upload Avatar" type="button">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                <polyline points="17 8 12 3 7 8"></polyline>
                                                <line x1="12" y1="3" x2="12" y2="15"></line>
                                            </svg>
                                        </button>
                                        {user.avatar && (
                                            <button onClick={() => setShowDeleteModal(true)} style={styles.iconBtnDelete} title="Delete Avatar" type="button">
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
                                <svg style={styles.verifiedBadge} viewBox="0 0 24 24" fill="#3b82f6">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p style={styles.profileEmail}>{user.email || 'name@example.com'}</p>
                        </div>

                        <div style={styles.gridContainer}>
                            <form onSubmit={handleSave} style={styles.cardBox}>
                                <div style={styles.cardHeaderRow}>
                                    <h3 style={styles.cardTitle}>Personal details</h3>
                                    {!isEditing ? (
                                        <button onClick={() => setIsEditing(true)} style={styles.iconEditBtn} title="Edit Details" type="button">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                            </svg>
                                        </button>
                                    ) : (
                                        <div style={styles.actionButtonGroup}>
                                            <button type="button" onClick={handleCancel} style={styles.cancelButton} disabled={processing}>Cancel</button>
                                            <button type="submit" style={styles.saveButton} disabled={processing}>{processing ? 'Saving...' : 'Save Changes'}</button>
                                        </div>
                                    )}
                                </div>

                                <div style={styles.detailRow}>
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

                                <div style={styles.detailRow}>
                                    <span style={styles.key}>Date of Birth:</span>
                                    {isEditing ? (
                                        <div style={styles.inputWrapper}>
                                            <input type="text" value={data.date_of_birth} onChange={e => setData('date_of_birth', e.target.value)} placeholder="e.g. January 1, 1987" style={styles.input} />
                                        </div>
                                    ) : (
                                        <span style={styles.value}>{user.date_of_birth || 'N/A'}</span>
                                    )}
                                </div>

                                <div style={styles.detailRow}>
                                    <span style={styles.key}>Gender:</span>
                                    {isEditing ? (
                                        <div style={styles.inputWrapper}>
                                            <input type="text" value={data.gender} onChange={e => setData('gender', e.target.value)} placeholder="e.g. Male" style={styles.input} />
                                        </div>
                                    ) : (
                                        <span style={styles.value}>{user.gender || 'N/A'}</span>
                                    )}
                                </div>

                                <div style={styles.detailRow}>
                                    <span style={styles.key}>Nationality:</span>
                                    {isEditing ? (
                                        <div style={styles.inputWrapper}>
                                            <input type="text" value={data.nationality} onChange={e => setData('nationality', e.target.value)} placeholder="e.g. American" style={styles.input} />
                                        </div>
                                    ) : (
                                        <span style={styles.value}>{user.nationality || 'N/A'}</span>
                                    )}
                                </div>

                                <div style={styles.detailRow}>
                                    <span style={styles.key}>Address:</span>
                                    {isEditing ? (
                                        <div style={styles.inputWrapper}>
                                            <input type="text" value={data.address} onChange={e => setData('address', e.target.value)} placeholder="e.g. California - United States" style={styles.input} />
                                        </div>
                                    ) : (
                                        <span style={styles.value}>{user.address || 'N/A'}</span>
                                    )}
                                </div>

                                <div style={styles.detailRow}>
                                    <span style={styles.key}>Phone Number:</span>
                                    {isEditing ? (
                                        <div style={styles.inputWrapper}>
                                            <input type="text" value={data.phone_number} onChange={e => setData('phone_number', e.target.value)} placeholder="e.g. (213) 555-1234" style={styles.input} />
                                        </div>
                                    ) : (
                                        <span style={styles.value}>{user.phone_number || 'N/A'}</span>
                                    )}
                                </div>

                                <div style={styles.detailRow}>
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
                                            <svg style={{ width: '96px', height: '96px' }} fill="#8b949e" viewBox="0 0 24 24">
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
                                    <button onClick={() => setShowDeleteModal(false)} style={styles.modalCancelBtn} type="button">Cancel</button>
                                    <button onClick={confirmDeleteAvatar} style={styles.modalDeleteBtn} type="button">Yes, Delete</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh',
        backgroundColor: '#12161f', display: 'flex', justifyContent: 'center', alignItems: 'center',
        margin: 0, padding: '24px', boxSizing: 'border-box', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    appWindow: {
        width: '100%', maxWidth: '1280px', height: '100%', maxHeight: '860px',
        backgroundColor: '#161b22', borderRadius: '16px', display: 'flex', overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', border: '1px solid #21262d',
    },
    mainContent: { flex: 1, backgroundColor: '#0d1117', overflowY: 'auto', padding: '24px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    contentBody: { display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '750px', margin: '0 auto' },
    iconEditBtn: {
        backgroundColor: '#21262d', color: '#8b949e', border: '1px solid #30363d', width: '30px', height: '30px',
        borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    },
    profileHeader: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px', width: '100%' },
    avatarContainer: { position: 'relative', marginBottom: '12px', cursor: 'pointer', width: '76px', height: '76px', borderRadius: '50%' },
    avatarWrapper: { width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '2px solid #30363d', backgroundColor: '#21262d' },
    avatar: { width: '100%', height: '100%', objectFit: 'cover' },
    blankAvatar: { width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#21262d' },
    blankAvatarIcon: { width: '44px', height: '44px' },
    hoverOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '50%',
        backgroundColor: 'transparent', display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        zIndex: 10, paddingBottom: '6px', transition: 'opacity 0.25s ease-in-out, visibility 0.25s ease-in-out',
    },
    bottomActionRow: { display: 'flex', gap: '4px' },
    iconBtn: { backgroundColor: '#30363d', color: '#ffffff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' },
    iconBtnUpload: { backgroundColor: '#1f6feb', color: '#ffffff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' },
    iconBtnDelete: { backgroundColor: '#da3633', color: '#ffffff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    viewModalBox: { backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '20px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.7)' },
    viewModalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    closeModalBtn: { background: 'none', border: 'none', color: '#8b949e', fontSize: '16px', cursor: 'pointer' },
    fullImageContainer: { width: '100%', height: '320px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d1117', borderRadius: '8px', overflow: 'hidden', border: '1px solid #30363d' },
    fullImage: { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' },
    fullBlankAvatar: { width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d1117' },
    modalBox: { backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '380px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', textAlign: 'center' },
    modalTitle: { fontSize: '16px', fontWeight: '600', color: '#ffffff', margin: 0 },
    modalText: { fontSize: '13px', color: '#8b949e', margin: '0 0 20px 0', lineHeight: '1.4' },
    modalActions: { display: 'flex', justifyContent: 'center', gap: '10px' },
    modalCancelBtn: { backgroundColor: 'transparent', color: '#8b949e', border: '1px solid #30363d', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
    modalDeleteBtn: { backgroundColor: '#da3633', color: '#ffffff', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
    profileNameRow: { display: 'flex', alignItems: 'center', gap: '6px' },
    profileName: { fontSize: '18px', fontWeight: '600', color: '#ffffff', margin: 0 },
    verifiedBadge: { width: '16px', height: '16px' },
    profileEmail: { fontSize: '13px', color: '#8b949e', margin: '4px 0 0 0' },
    gridContainer: { display: 'flex', justifyContent: 'center', paddingBottom: '20px', width: '100%' },
    cardBox: { width: '100%', maxWidth: '750px', backgroundColor: '#161b22', borderRadius: '12px', border: '1px solid #30363d', padding: '20px', boxSizing: 'border-box' },
    cardHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    cardTitle: { fontSize: '14px', fontWeight: '600', color: '#ffffff', margin: 0 },
    actionButtonGroup: { display: 'flex', gap: '8px' },
    cancelButton: { backgroundColor: 'transparent', color: '#8b949e', border: '1px solid #30363d', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
    saveButton: { backgroundColor: '#1f6feb', color: '#ffffff', border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
    detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '8px 0', borderBottom: '1px solid #21262d' },
    key: { color: '#8b949e', flexBasis: '35%' },
    value: { color: '#c9d1d9', fontWeight: '500', flexBasis: '65%', textAlign: 'right' },
    disabledValue: { color: '#484f58', fontWeight: '500', flexBasis: '65%', textAlign: 'right' },
    inputWrapper: { flexBasis: '65%', display: 'flex', flexDirection: 'column' },
    input: { width: '100%', backgroundColor: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', padding: '6px 10px', color: '#ffffff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' },
    errorText: { color: '#f85149', fontSize: '11px', marginTop: '4px', textAlign: 'center' },
};