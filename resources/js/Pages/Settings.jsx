import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import Toast from '@/Components/Toast';
import Breadcrumb from '@/Components/Breadcrumb';

export default function Settings({ carServices: initialCarServices = [], motoServices: initialMotoServices = [] }) {
    const { flash } = usePage().props;

    const [carServices, setCarServices] = useState(initialCarServices);
    const [motoServices, setMotoServices] = useState(initialMotoServices);
    const [toastMessage, setToastMessage] = useState(null);

    const [carOpen, setCarOpen] = useState(false);
    const [motoOpen, setMotoOpen] = useState(false);

    const [activeModal, setActiveModal] = useState(null);
    const [tempServices, setTempServices] = useState([]);
    const [newItem, setNewItem] = useState({
        name: '',
        interval_days: '',
        interval_odo: '',
    });

    const formatIntervalDays = (totalDays) => {
        const daysNum = Number(totalDays);
        if (!daysNum || isNaN(daysNum) || daysNum <= 0) return null;

        if (daysNum < 30) {
            return `${daysNum} ${daysNum === 1 ? 'Day' : 'Days'}`;
        }

        const years = Math.floor(daysNum / 365);
        const remainingAfterYears = daysNum % 365;
        const months = Math.floor(remainingAfterYears / 30);
        const days = remainingAfterYears % 30;

        let parts = [];
        if (years > 0) parts.push(`${years} ${years === 1 ? 'Year' : 'Years'}`);
        if (months > 0) parts.push(`${months} ${months === 1 ? 'Month' : 'Months'}`);
        if (days > 0 || parts.length === 0) parts.push(`${days} ${days === 1 ? 'Day' : 'Days'}`);

        if (parts.length === 1) return parts[0];
        if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
        return `${parts[0]}, ${parts[1]}, and ${parts[2]}`;
    };

    const openModal = (type, e) => {
        if (e) e.stopPropagation();
        setActiveModal(type);
        const currentList = type === 'car' ? carServices : motoServices;
        setTempServices(currentList.map(item => ({
            ...item,
            interval_days: item.interval_days ?? '',
            interval_odo: item.interval_odo ?? '',
        })));
        setNewItem({ name: '', interval_days: '', interval_odo: '' });
    };

    const closeModal = () => {
        setActiveModal(null);
        setTempServices([]);
        setNewItem({ name: '', interval_days: '', interval_odo: '' });
    };

    const handleAddItem = (e) => {
        e.preventDefault();
        if (!newItem.name.trim()) return;

        setTempServices([
            ...tempServices,
            {
                id: Date.now() + Math.random(),
                name: newItem.name.trim(),
                interval_days: newItem.interval_days ? Number(newItem.interval_days) : '',
                interval_odo: newItem.interval_odo ? Number(newItem.interval_odo) : '',
            }
        ]);

        setNewItem({ name: '', interval_days: '', interval_odo: '' });
    };

    const handleUpdateTempItem = (id, field, value) => {
        setTempServices(tempServices.map(item => 
            item.id === id ? { ...item, [field]: value } : item
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
                    from { opacity: 0; transform: translateY(16px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes fadeInOverlay {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes staggerFadeIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animated-modal {
                    animation: slideUpFade 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animated-overlay {
                    animation: fadeInOverlay 0.2s ease-out forwards;
                }
                .page-card-anim {
                    animation: staggerFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .interactive-card {
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .interactive-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(28, 28, 28, 0.08);
                    border-color: #b5b0a6;
                }
                .hover-list-item {
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .hover-list-item:hover {
                    transform: translateX(4px);
                    background-color: rgba(237, 230, 216, 0.9) !important;
                    border-color: #b5b0a6 !important;
                }
                .hover-btn {
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .hover-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(28, 28, 28, 0.12);
                }
                .hover-btn:active {
                    transform: translateY(1px);
                }
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                .tooltip-container {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                }
                .tooltip-text {
                    visibility: hidden;
                    width: 240px;
                    background-color: #1c1c1c;
                    color: #ede6d8;
                    text-align: left;
                    border-radius: 6px;
                    padding: 8px 12px;
                    position: absolute;
                    z-index: 1050;
                    bottom: 125%;
                    left: 50%;
                    transform: translateX(-50%);
                    opacity: 0;
                    transition: opacity 0.2s;
                    font-size: 11px;
                    font-weight: normal;
                    line-height: 1.4;
                    border: 1px solid #2e2e2e;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }
                .tooltip-container:hover .tooltip-text {
                    visibility: visible;
                    opacity: 1;
                }
            `}</style>

            <div style={styles.appWindow}>
                <Sidebar activePage="settings" />

                <div style={styles.mainContent}>
                    <Toast message={toastMessage} duration={3000} onClose={() => setToastMessage(null)} />

                    <Breadcrumb items={[{ label: 'Main', href: '/home' }, { label: 'Settings' }]} />

                    <div style={styles.contentBody}>
                        <h1 style={styles.pageTitle}>Settings</h1>

                        <div style={styles.sectionBlock}>
                            <h2 style={styles.sectionHeaderTitle}>Services Configuration</h2>
                            <p style={styles.sectionHeaderDesc}>Configure maintenance service types and periodic intervals for your fleet vehicles.</p>

                            <div style={styles.settingsCard} className="interactive-card page-card-anim">
                                <div style={styles.cardTitleRow} onClick={() => setCarOpen(!carOpen)}>
                                    <div style={styles.cardTitleLeft}>
                                        <svg 
                                            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6e6962" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" 
                                            style={{ transform: carOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
                                        >
                                            <polyline points="9 18 15 12 9 6"></polyline>
                                        </svg>
                                        <h3 style={styles.cardTitle}>Car Services</h3>
                                    </div>
                                    <div style={styles.cardTitleRight} onClick={e => e.stopPropagation()}>
                                        {carServices.length > 0 && (
                                            <button onClick={(e) => openModal('car', e)} style={styles.iconEditBtn} className="hover-btn" title="Edit Services" type="button">
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {carOpen && (
                                    <div style={styles.collapsibleContent}>
                                        {carServices.length === 0 ? (
                                            <div style={styles.emptyContainer}>
                                                <span style={styles.emptyStateText}>No services available</span>
                                                <button onClick={(e) => openModal('car', e)} style={styles.primaryAddBtn} className="hover-btn">+ Add Services</button>
                                            </div>
                                        ) : (
                                            <div style={styles.verticalList}>
                                                {carServices.map((item) => (
                                                    <div key={item.id} style={styles.verticalItem} className="hover-list-item">
                                                        <span style={styles.verticalItemText}>{item.name}</span>
                                                        <div style={styles.intervalTagsGroup}>
                                                            {item.interval_days && <span style={styles.intervalBadge}>Every {formatIntervalDays(item.interval_days)}</span>}
                                                            {item.interval_odo && <span style={styles.intervalBadge}>Every {Number(item.interval_odo).toLocaleString()} ODO</span>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div style={styles.settingsCard} className="interactive-card page-card-anim">
                                <div style={styles.cardTitleRow} onClick={() => setMotoOpen(!motoOpen)}>
                                    <div style={styles.cardTitleLeft}>
                                        <svg 
                                            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6e6962" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" 
                                            style={{ transform: motoOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
                                        >
                                            <polyline points="9 18 15 12 9 6"></polyline>
                                        </svg>
                                        <h3 style={styles.cardTitle}>Motorbike Services</h3>
                                    </div>
                                    <div style={styles.cardTitleRight} onClick={e => e.stopPropagation()}>
                                        {motoServices.length > 0 && (
                                            <button onClick={(e) => openModal('moto', e)} style={styles.iconEditBtn} className="hover-btn" title="Edit Services" type="button">
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {motoOpen && (
                                    <div style={styles.collapsibleContent}>
                                        {motoServices.length === 0 ? (
                                            <div style={styles.emptyContainer}>
                                                <span style={styles.emptyStateText}>No services available</span>
                                                <button onClick={(e) => openModal('moto', e)} style={styles.primaryAddBtn} className="hover-btn">+ Add Services</button>
                                            </div>
                                        ) : (
                                            <div style={styles.verticalList}>
                                                {motoServices.map((item) => (
                                                    <div key={item.id} style={styles.verticalItem} className="hover-list-item">
                                                        <span style={styles.verticalItemText}>{item.name}</span>
                                                        <div style={styles.intervalTagsGroup}>
                                                            {item.interval_days && <span style={styles.intervalBadge}>Every {formatIntervalDays(item.interval_days)}</span>}
                                                            {item.interval_odo && <span style={styles.intervalBadge}>Every {Number(item.interval_odo).toLocaleString()} ODO</span>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {activeModal && (
                        <div style={styles.modalOverlay} className="animated-overlay">
                            <div style={styles.modalBox} className="animated-modal">
                                <div style={styles.modalHeader}>
                                    <div style={styles.modalTitleWrapper}>
                                        <h3 style={styles.modalTitle}>
                                            {activeModal === 'car' ? 'Manage Car Services' : 'Manage Motorbike Services'}
                                        </h3>
                                        <div className="tooltip-container" style={styles.tooltipIconWrapper}>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6e6962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'pointer' }}>
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                            </svg>
                                            <span className="tooltip-text">
                                                Set the maintenance services along with their periodic days or ODO interval targets.
                                            </span>
                                        </div>
                                    </div>
                                    <button onClick={closeModal} style={styles.closeBtn} type="button">✕</button>
                                </div>

                                <form onSubmit={handleAddItem} style={styles.addItemForm}>
                                    <div style={styles.formRow}>
                                        <input 
                                            type="text" value={newItem.name}
                                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                            placeholder="Service name (e.g. Oil Change)"
                                            style={{ ...styles.modalInput, flex: 2 }}
                                        />
                                        <input 
                                            type="text" value={newItem.interval_days}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (/^\d*$/.test(val)) setNewItem({ ...newItem, interval_days: val });
                                            }}
                                            placeholder="Days"
                                            style={{ ...styles.modalInput, flex: 1 }}
                                        />
                                        <input 
                                            type="text" value={newItem.interval_odo}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (/^\d*$/.test(val)) setNewItem({ ...newItem, interval_odo: val });
                                            }}
                                            placeholder="ODO"
                                            style={{ ...styles.modalInput, flex: 1 }}
                                        />
                                        <button type="submit" style={styles.modalAddBtn} className="hover-btn">Add</button>
                                    </div>
                                </form>

                                <div style={styles.modalListHeader}>
                                    <span style={{ flex: 2 }}>Service Name</span>
                                    <span style={{ flex: 1 }}>Every (Days)</span>
                                    <span style={{ flex: 1 }}>Every (ODO)</span>
                                    <span style={{ width: '28px' }}></span>
                                </div>

                                <div style={styles.modalListContainer}>
                                    {tempServices.length === 0 ? (
                                        <p style={styles.modalEmptyText}>No items added yet. You can save to clear the list.</p>
                                    ) : (
                                        tempServices.map((item) => (
                                            <div key={item.id} style={styles.modalListItem} className="hover-list-item">
                                                <input 
                                                    type="text" value={item.name}
                                                    onChange={(e) => handleUpdateTempItem(item.id, 'name', e.target.value)}
                                                    placeholder="Service Name"
                                                    style={{ ...styles.modalInlineInput, flex: 2 }}
                                                />
                                                <input 
                                                    type="text" value={item.interval_days}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (/^\d*$/.test(val)) handleUpdateTempItem(item.id, 'interval_days', val);
                                                    }}
                                                    placeholder="Days"
                                                    style={{ ...styles.modalInlineInput, flex: 1 }}
                                                />
                                                <input 
                                                    type="text" value={item.interval_odo}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (/^\d*$/.test(val)) handleUpdateTempItem(item.id, 'interval_odo', val);
                                                    }}
                                                    placeholder="ODO"
                                                    style={{ ...styles.modalInlineInput, flex: 1 }}
                                                />
                                                <button onClick={() => handleRemoveTempItem(item.id)} style={styles.iconDeleteBtn} className="hover-btn" type="button" title="Remove item">
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
                                    <button onClick={closeModal} style={styles.cancelBtn} className="hover-btn" type="button">Cancel</button>
                                    <button onClick={handleSaveModal} style={styles.saveBtn} className="hover-btn" type="button">Save Changes</button>
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
        backgroundColor: '#ede6d8', display: 'flex', justifyContent: 'center', alignItems: 'center',
        margin: 0, padding: '24px', boxSizing: 'border-box', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    appWindow: {
        width: '100%', maxWidth: '1280px', height: '100%', maxHeight: '860px',
        backgroundColor: '#ffffff', borderRadius: '16px', display: 'flex', overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(28, 28, 28, 0.1)', border: '1px solid #d6ccbb',
    },
    mainContent: { flex: 1, backgroundColor: '#ede6d8', overflowY: 'auto', padding: '24px 36px', display: 'flex', flexDirection: 'column', position: 'relative', alignItems: 'center' },
    contentBody: { display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '750px', width: '100%', paddingBottom: '40px', margin: '0 auto' },
    pageTitle: { fontSize: '28px', fontWeight: '700', color: '#1c1c1c', letterSpacing: '-0.5px', margin: 0 },
    sectionBlock: { display: 'flex', flexDirection: 'column', gap: '16px' },
    sectionHeaderTitle: { color: '#1c1c1c', fontSize: '18px', fontWeight: '600', margin: 0 },
    sectionHeaderDesc: { color: '#6e6962', fontSize: '13px', margin: '-10px 0 0 0' },
    settingsCard: {
        backgroundColor: '#ffffff', border: '1px solid #d6ccbb', borderRadius: '12px',
        padding: '20px', boxShadow: '0 4px 12px rgba(28, 28, 28, 0.04)', display: 'flex', flexDirection: 'column', gap: '16px',
    },
    cardTitleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' },
    cardTitleLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
    cardTitleRight: { display: 'flex', alignItems: 'center' },
    cardTitle: { color: '#1c1c1c', fontSize: '15px', fontWeight: '600', margin: 0 },
    collapsibleContent: { display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '4px' },
    iconEditBtn: {
        backgroundColor: '#ede6d8', color: '#1c1c1c', border: '1px solid #d6ccbb', width: '32px', height: '32px',
        borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    },
    emptyContainer: {
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '12px', padding: '24px 0', border: '1px dashed #d6ccbb', borderRadius: '8px', backgroundColor: '#ede6d8',
    },
    emptyStateText: { color: '#6e6962', fontSize: '13px', fontStyle: 'italic' },
    primaryAddBtn: { backgroundColor: '#1c1c1c', color: '#ede6d8', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
    verticalList: { display: 'flex', flexDirection: 'column', gap: '8px' },
    verticalItem: {
        backgroundColor: '#ede6d8', border: '1px solid #d6ccbb', borderRadius: '8px',
        padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    verticalItemText: { color: '#1c1c1c', fontSize: '13px', fontWeight: '500' },
    intervalTagsGroup: { display: 'flex', gap: '6px' },
    intervalBadge: { backgroundColor: '#1c1c1c10', color: '#1c1c1c', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px' },
    
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(28, 28, 28, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalBox: {
        backgroundColor: '#ffffff', border: '1px solid #d6ccbb', borderRadius: '14px',
        padding: '24px', width: '100%', maxWidth: '640px', boxShadow: '0 25px 50px rgba(28, 28, 28, 0.2)',
        display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box',
    },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    modalTitleWrapper: { display: 'flex', alignItems: 'center', gap: '10px' },
    modalTitle: { color: '#1c1c1c', fontSize: '16px', fontWeight: '600', margin: 0 },
    tooltipIconWrapper: { display: 'flex', alignItems: 'center' },
    closeBtn: { background: 'none', border: 'none', color: '#6e6962', fontSize: '16px', cursor: 'pointer' },
    addItemForm: { display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', boxSizing: 'border-box' },
    formRow: { display: 'flex', gap: '8px', width: '100%', alignItems: 'center', boxSizing: 'border-box' },
    modalInput: { backgroundColor: '#ede6d8', border: '1px solid #d6ccbb', borderRadius: '6px', padding: '8px 10px', color: '#1c1c1c', fontSize: '12px', outline: 'none', boxSizing: 'border-box' },
    modalAddBtn: { backgroundColor: '#1c1c1c', color: '#ede6d8', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', flexShrink: 0 },
    modalListHeader: { display: 'flex', gap: '8px', padding: '0 8px', color: '#6e6962', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', boxSizing: 'border-box' },
    modalListContainer: { display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '260px', overflowY: 'auto', paddingRight: '4px', boxSizing: 'border-box' },
    modalEmptyText: { color: '#6e6962', fontSize: '12px', textAlign: 'center', margin: '12px 0' },
    modalListItem: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#ede6d8', border: '1px solid #d6ccbb', borderRadius: '6px',
        padding: '6px 8px', gap: '8px', boxSizing: 'border-box', width: '100%',
    },
    modalInlineInput: { backgroundColor: '#ffffff', border: '1px solid #d6ccbb', borderRadius: '4px', color: '#1c1c1c', fontSize: '12px', outline: 'none', padding: '6px 8px', boxSizing: 'border-box' },
    iconDeleteBtn: { backgroundColor: 'transparent', border: 'none', color: '#b3251e', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.9, flexShrink: 0 },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #ede6d8', paddingTop: '14px', marginTop: '4px', boxSizing: 'border-box' },
    cancelBtn: { backgroundColor: '#ede6d8', color: '#1c1c1c', border: '1px solid #d6ccbb', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
    saveBtn: { backgroundColor: '#1c1c1c', color: '#ede6d8', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
};