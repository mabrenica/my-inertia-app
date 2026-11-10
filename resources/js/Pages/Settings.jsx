import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import Toast from '@/Components/Toast';

export default function Settings({ carServices: initialCarServices = [], motoServices: initialMotoServices = [] }) {
    const { flash } = usePage().props;

    // Services state initialized from backend props
    const [carServices, setCarServices] = useState(initialCarServices);
    const [motoServices, setMotoServices] = useState(initialMotoServices);

    // Toast state
    const [toastMessage, setToastMessage] = useState(null);

    // Modal state
    const [activeModal, setActiveModal] = useState(null); // 'car' | 'moto' | null
    const [tempServices, setTempServices] = useState([]);
    const [newItemText, setNewItemText] = useState('');

    const openModal = (type) => {
        setActiveModal(type);
        const currentList = type === 'car' ? carServices : motoServices;
        setTempServices([...currentList]);
        setNewItemText('');
    };

    const closeModal = () => {
        setActiveModal(null);
        setTempServices([]);
        setNewItemText('');
    };

    const handleAddItem = (e) => {
        e.preventDefault();
        if (!newItemText.trim()) return;
        setTempServices([...tempServices, { id: Date.now() + Math.random(), name: newItemText.trim() }]);
        setNewItemText('');
    };

    const handleUpdateTempItem = (id, newName) => {
        setTempServices(tempServices.map(item => 
            item.id === id ? { ...item, name: newName } : item
        ));
    };

    const handleRemoveTempItem = (id) => {
        setTempServices(tempServices.filter(item => item.id !== id));
    };

    const handleSaveModal = () => {
        const updatedCar = activeModal === 'car' ? tempServices : carServices;
        const updatedMoto = activeModal === 'moto' ? tempServices : motoServices;

        router.post('/settings/services', {
            car_services: updatedCar,
            moto_services: updatedMoto,
        }, {
            onSuccess: () => {
                if (activeModal === 'car') setCarServices(updatedCar);
                if (activeModal === 'moto') setMotoServices(updatedMoto);
                setToastMessage('Services updated successfully!');
                closeModal();
            }
        });
    };

    return (
        <div style={styles.page}>
            <style>{`
                @keyframes slideUpFade {
                    from { opacity: 0; transform: translateY(12px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes fadeInOverlay {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animated-modal {
                    animation: slideUpFade 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animated-overlay {
                    animation: fadeInOverlay 0.2s ease-out forwards;
                }
            `}</style>

            <div style={styles.appWindow}>
                <Sidebar activePage="settings" />

                <div style={styles.mainContent}>
                    <Toast message={toastMessage} duration={3000} onClose={() => setToastMessage(null)} />

                    <div style={styles.topBar}>
                        <div style={styles.breadcrumb}>
                            Main / <span style={{ color: '#ffffff', fontWeight: '500' }}>Settings</span>
                        </div>
                    </div>

                    <div style={styles.contentBody}>
                        <h1 style={styles.pageTitle}>Settings</h1>

                        <div style={styles.sectionBlock}>
                            <h2 style={styles.sectionHeaderTitle}>Services Configuration</h2>
                            <p style={styles.sectionHeaderDesc}>Configure available maintenance and service types for your fleet vehicles.</p>

                            {/* 1. Car Services Card */}
                            <div style={styles.settingsCard}>
                                <div style={styles.cardTitleRow}>
                                    <h3 style={styles.cardTitle}>Car Services</h3>
                                    {carServices.length > 0 && (
                                        <button 
                                            onClick={() => openModal('car')} 
                                            style={styles.iconEditBtn}
                                            title="Edit Services"
                                            type="button"
                                        >
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                {carServices.length === 0 ? (
                                    <div style={styles.emptyContainer}>
                                        <span style={styles.emptyStateText}>No services available</span>
                                        <button onClick={() => openModal('car')} style={styles.primaryAddBtn}>
                                            + Add Services
                                        </button>
                                    </div>
                                ) : (
                                    <div style={styles.verticalList}>
                                        {carServices.map((item) => (
                                            <div key={item.id} style={styles.verticalItem}>
                                                <span style={styles.verticalItemText}>{item.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 2. Motorbike Services Card */}
                            <div style={styles.settingsCard}>
                                <div style={styles.cardTitleRow}>
                                    <h3 style={styles.cardTitle}>Motorbike Services</h3>
                                    {motoServices.length > 0 && (
                                        <button 
                                            onClick={() => openModal('moto')} 
                                            style={styles.iconEditBtn}
                                            title="Edit Services"
                                            type="button"
                                        >
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                {motoServices.length === 0 ? (
                                    <div style={styles.emptyContainer}>
                                        <span style={styles.emptyStateText}>No services available</span>
                                        <button onClick={() => openModal('moto')} style={styles.primaryAddBtn}>
                                            + Add Services
                                        </button>
                                    </div>
                                ) : (
                                    <div style={styles.verticalList}>
                                        {motoServices.map((item) => (
                                            <div key={item.id} style={styles.verticalItem}>
                                                <span style={styles.verticalItemText}>{item.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* Manage / Edit Services Modal */}
                    {activeModal && (
                        <div style={styles.modalOverlay} className="animated-overlay">
                            <div style={styles.modalBox} className="animated-modal">
                                <div style={styles.modalHeader}>
                                    <h3 style={styles.modalTitle}>
                                        {activeModal === 'car' ? 'Manage Car Services' : 'Manage Motorbike Services'}
                                    </h3>
                                    <button onClick={closeModal} style={styles.closeBtn} type="button">✕</button>
                                </div>

                                <form onSubmit={handleAddItem} style={styles.addItemForm}>
                                    <input 
                                        type="text"
                                        value={newItemText}
                                        onChange={(e) => setNewItemText(e.target.value)}
                                        placeholder="e.g. Oil change, Tire replacement..."
                                        style={styles.modalInput}
                                    />
                                    <button type="submit" style={styles.modalAddBtn}>Add</button>
                                </form>

                                <div style={styles.modalListContainer}>
                                    {tempServices.length === 0 ? (
                                        <p style={styles.modalEmptyText}>No items added yet. You can save to clear the list.</p>
                                    ) : (
                                        tempServices.map((item) => (
                                            <div key={item.id} style={styles.modalListItem}>
                                                <input 
                                                    type="text"
                                                    value={item.name}
                                                    onChange={(e) => handleUpdateTempItem(item.id, e.target.value)}
                                                    style={styles.modalInlineInput}
                                                />
                                                <button 
                                                    onClick={() => handleRemoveTempItem(item.id)}
                                                    style={styles.iconDeleteBtn}
                                                    type="button"
                                                    title="Remove item"
                                                >
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div style={styles.modalActions}>
                                    <button onClick={closeModal} style={styles.cancelBtn} type="button">
                                        Cancel
                                    </button>
                                    <button onClick={handleSaveModal} style={styles.saveBtn} type="button">
                                        Save Changes
                                    </button>
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
        padding: '24px',
        boxSizing: 'border-box',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    appWindow: {
        width: '100%',
        maxWidth: '1280px',
        height: '100%',
        maxHeight: '860px',
        backgroundColor: '#161b22',
        borderRadius: '16px',
        display: 'flex',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        border: '1px solid #21262d',
    },
    mainContent: {
        flex: 1,
        backgroundColor: '#0d1117',
        overflowY: 'auto',
        padding: '24px 36px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
    },
    topBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    breadcrumb: {
        fontSize: '12px',
        color: '#8b949e',
    },
    contentBody: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        maxWidth: '750px',
        paddingBottom: '40px',
    },
    pageTitle: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: '-0.5px',
        margin: 0,
    },
    sectionBlock: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    sectionHeaderTitle: {
        color: '#ffffff',
        fontSize: '18px',
        fontWeight: '600',
        margin: 0,
    },
    sectionHeaderDesc: {
        color: '#8b949e',
        fontSize: '13px',
        margin: '-10px 0 0 0',
    },
    settingsCard: {
        backgroundColor: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    cardTitleRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        color: '#ffffff',
        fontSize: '15px',
        fontWeight: '600',
        margin: 0,
    },
    iconEditBtn: {
        backgroundColor: '#21262d',
        color: '#8b949e',
        border: '1px solid #30363d',
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'color 0.2s, background-color 0.2s',
    },
    emptyContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '24px 0',
        border: '1px dashed #30363d',
        borderRadius: '8px',
        backgroundColor: '#0d1117',
    },
    emptyStateText: {
        color: '#8b949e',
        fontSize: '13px',
        fontStyle: 'italic',
    },
    primaryAddBtn: {
        backgroundColor: '#1f6feb',
        color: '#ffffff',
        border: 'none',
        borderRadius: '6px',
        padding: '6px 14px',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
    },
    verticalList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    verticalItem: {
        backgroundColor: '#0d1117',
        border: '1px solid #30363d',
        borderRadius: '8px',
        padding: '10px 14px',
    },
    verticalItemText: {
        color: '#c9d1d9',
        fontSize: '13px',
        fontWeight: '500',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalBox: {
        backgroundColor: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '12px',
        padding: '20px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalTitle: {
        color: '#ffffff',
        fontSize: '15px',
        fontWeight: '600',
        margin: 0,
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: '#8b949e',
        fontSize: '16px',
        cursor: 'pointer',
    },
    addItemForm: {
        display: 'flex',
        gap: '8px',
    },
    modalInput: {
        flex: 1,
        backgroundColor: '#0d1117',
        border: '1px solid #30363d',
        borderRadius: '6px',
        padding: '7px 10px',
        color: '#ffffff',
        fontSize: '12px',
        outline: 'none',
    },
    modalAddBtn: {
        backgroundColor: '#1f6feb',
        color: '#ffffff',
        border: 'none',
        borderRadius: '6px',
        padding: '0 14px',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
    },
    modalListContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        maxHeight: '220px',
        overflowY: 'auto',
        paddingRight: '4px',
    },
    modalEmptyText: {
        color: '#8b949e',
        fontSize: '12px',
        textAlign: 'center',
        margin: '12px 0',
    },
    modalListItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#0d1117',
        border: '1px solid #21262d',
        borderRadius: '6px',
        padding: '6px 12px',
        gap: '8px',
    },
    modalInlineInput: {
        flex: 1,
        backgroundColor: 'transparent',
        border: 'none',
        color: '#c9d1d9',
        fontSize: '12px',
        outline: 'none',
        padding: '4px 0',
    },
    iconDeleteBtn: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#f85149',
        cursor: 'pointer',
        padding: '2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.8,
    },
    modalActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '8px',
        borderTop: '1px solid #21262d',
        paddingTop: '14px',
        marginTop: '4px',
    },
    cancelBtn: {
        backgroundColor: 'transparent',
        color: '#8b949e',
        border: '1px solid #30363d',
        padding: '6px 14px',
        borderRadius: '6px',
        fontSize: '12px',
        cursor: 'pointer',
    },
    saveBtn: {
        backgroundColor: '#1f6feb',
        color: '#ffffff',
        border: 'none',
        padding: '6px 14px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
    },
};