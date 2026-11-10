import { useState, useRef, useEffect } from 'react';
import { useForm, router, usePage, Link } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import Toast from '@/Components/Toast';

export default function Home({ vehicles = [], servicePreferences = {} }) {
    const { flash } = usePage().props;

    const [showModal, setShowModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [removeExistingPhoto, setRemoveExistingPhoto] = useState(false);
    
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState(null);

    const [toastMessage, setToastMessage] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setToastMessage(flash.success);
        }
    }, [flash]);

    const fileInputRef = useRef(null);

    const { data, setData, post, processing, errors, setError, clearErrors, reset } = useForm({
        type: 'Car',
        make: '',
        model: '',
        year: '',
        description: '',
        photo: null,
    });

    // Get today's date in Philippine time (YYYY-MM-DD)
    const getPhilippineToday = () => {
        const options = { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' };
        const formatter = new Intl.DateTimeFormat('en-CA', options);
        return formatter.format(new Date());
    };

    const formatDateToReadable = (dateStr) => {
        if (!dateStr || dateStr === '—') return dateStr;
        const [year, month, day] = dateStr.split('-');
        if (!year || !month || !day) return dateStr;
        const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
        if (isNaN(dateObj.getTime())) return dateStr;
        return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Calculate all Upcoming and Past Due services across all vehicles
    const todayStr = getPhilippineToday();
    const todayObj = new Date(todayStr);

    const upcomingAlerts = [];
    const pastDueAlerts = [];

    vehicles.forEach(vehicle => {
        const currentOdoNum = vehicle.current_odo !== null && vehicle.current_odo !== undefined && vehicle.current_odo !== '' 
            ? Number(vehicle.current_odo) 
            : null;

        const isCar = (vehicle.type || '').toLowerCase() === 'car';
        const prefs = isCar ? (servicePreferences.car_services || []) : (servicePreferences.moto_services || []);
        const logs = vehicle.maintenance_logs || vehicle.maintenanceLogs || [];

        prefs.forEach(pref => {
            const name = pref.name;
            const intervalDays = pref.interval_days ? Number(pref.interval_days) : null;
            const intervalOdo = pref.interval_odo ? Number(pref.interval_odo) : null;

            const matchingLogs = logs.filter(log => log.services && log.services.includes(name));

            let latestDate = null;
            let highestOdo = null;

            if (matchingLogs.length > 0) {
                const dates = matchingLogs.map(l => l.date).filter(Boolean).sort();
                if (dates.length > 0) latestDate = dates[dates.length - 1];

                const odos = matchingLogs.map(l => Number(l.odo)).filter(o => !isNaN(o));
                if (odos.length > 0) highestOdo = Math.max(...odos);
            }

            // Date evaluation
            let nextDateStr = null;
            let dateStatus = null; // 'past_due' | 'upcoming'
            if (latestDate && intervalDays) {
                const d = new Date(latestDate);
                d.setDate(d.getDate() + intervalDays);
                nextDateStr = d.toISOString().split('T')[0];

                const targetDateObj = new Date(nextDateStr);
                const diffTime = targetDateObj - todayObj;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < 0) {
                    dateStatus = 'past_due';
                } else if (diffDays <= 15) {
                    dateStatus = 'upcoming';
                }
            }

            // ODO evaluation
            let nextOdoVal = null;
            let odoStatus = null; // 'past_due' | 'upcoming'
            if (highestOdo !== null && intervalOdo !== null && currentOdoNum !== null) {
                nextOdoVal = highestOdo + intervalOdo;
                const odoDiff = nextOdoVal - currentOdoNum;

                if (odoDiff <= 0) {
                    odoStatus = 'past_due';
                } else if (odoDiff <= 1000) {
                    odoStatus = 'upcoming';
                }
            }

            // Determine final bucket (Past Due takes precedence)
            const isPastDue = dateStatus === 'past_due' || odoStatus === 'past_due';
            const isUpcoming = !isPastDue && (dateStatus === 'upcoming' || odoStatus === 'upcoming');

            if (isPastDue || isUpcoming) {
                const triggerReasons = [];
                if (dateStatus) {
                    triggerReasons.push(`Date: ${formatDateToReadable(nextDateStr)}`);
                }
                if (odoStatus && nextOdoVal !== null) {
                    triggerReasons.push(`ODO: ${nextOdoVal.toLocaleString()} km`);
                }

                const alertItem = {
                    vehicleId: vehicle.id,
                    vehicleName: `${vehicle.make} ${vehicle.model}`,
                    serviceName: name,
                    triggerText: triggerReasons.join(' • '),
                };

                if (isPastDue) {
                    pastDueAlerts.push(alertItem);
                } else {
                    upcomingAlerts.push(alertItem);
                }
            }
        });
    });

    const openCreateModal = () => {
        setEditingVehicle(null);
        setRemoveExistingPhoto(false);
        clearErrors();
        setData({
            type: 'Car',
            make: '',
            model: '',
            year: '',
            description: '',
            photo: null,
        });
        setShowModal(true);
    };

    const openEditModal = (vehicle) => {
        setEditingVehicle(vehicle);
        setRemoveExistingPhoto(false);
        clearErrors();
        setData({
            type: vehicle.type || 'Car',
            make: vehicle.make || '',
            model: vehicle.model || '',
            year: vehicle.year || '',
            description: vehicle.description || '',
            photo: null,
        });
        setShowModal(true);
    };

    const promptDeleteVehicle = (vehicle) => {
        setVehicleToDelete(vehicle);
        setShowDeleteModal(true);
    };

    const confirmDeleteVehicle = () => {
        if (vehicleToDelete) {
            router.delete(`/vehicles/${vehicleToDelete.id}`, {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setVehicleToDelete(null);
                },
            });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            clearErrors('photo');
            const maxSizeInBytes = 2100 * 1024;
            if (file.size > maxSizeInBytes) {
                setError('photo', 'The photo must not be greater than 2100 KB.');
                return;
            }
            setData('photo', file);
            setRemoveExistingPhoto(false);
        }
    };

    const handleRemovePhotoClick = (e) => {
        e.stopPropagation();
        setData('photo', null);
        setRemoveExistingPhoto(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors('photo');

        if (data.photo) {
            const maxSizeInBytes = 2100 * 1024;
            if (data.photo.size > maxSizeInBytes) {
                setError('photo', 'The photo must not be greater than 2100 KB.');
                return;
            }
        }

        const formData = {
            ...data,
            remove_photo: removeExistingPhoto ? 1 : 0,
        };

        if (editingVehicle) {
            router.post(`/vehicles/${editingVehicle.id}`, formData, {
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    setShowModal(false);
                    setEditingVehicle(null);
                    setRemoveExistingPhoto(false);
                },
            });
        } else {
            router.post('/vehicles', formData, {
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    setShowModal(false);
                },
            });
        }
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
                <Sidebar activePage="home" />

                <div style={styles.mainContent}>
                    <Toast message={toastMessage} duration={3000} onClose={() => setToastMessage(null)} />

                    <div style={styles.topBar}>
                        <div style={styles.breadcrumb}>
                            Main / <span style={{ color: '#ffffff', fontWeight: '500' }}>Home</span>
                        </div>
                    </div>

                    <div style={styles.contentBody}>
                        <div style={styles.pageHeaderRow}>
                            <h1 style={styles.pageTitle}>My Rides</h1>
                            <button 
                                onClick={openCreateModal} 
                                style={styles.addButton}
                                type="button"
                            >
                                + Add Vehicle
                            </button>
                        </div>

                        {/* Vehicles Grid Section */}
                        <div style={styles.vehicleGrid}>
                            {vehicles.length === 0 ? (
                                <p style={styles.emptyText}>No vehicle records added yet. Click "+ Add Vehicle" to get started.</p>
                            ) : (
                                vehicles.map((vehicle) => (
                                    <div key={vehicle.id} style={styles.vehicleCard}>
                                        <div 
                                            style={styles.cardContentClickable} 
                                            onClick={() => router.visit(`/vehicles/${vehicle.id}`)}
                                        >
                                            {vehicle.photo ? (
                                                <img src={`/storage/${vehicle.photo}`} alt={vehicle.make} style={styles.vehicleThumb} />
                                            ) : (
                                                <div style={styles.placeholderThumb}>
                                                    {vehicle.type === 'Car' ? (
                                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2.5-4.5c-.3-.5-.9-.8-1.5-.8H10c-.6 0-1.2.3-1.5.8L6 10l-2.5 1.1C2.7 12.3 2 13.1 2 14v3c0 .6.4 1 1 1h2"></path>
                                                            <circle cx="7" cy="17" r="2"></circle>
                                                            <circle cx="17" cy="17" r="2"></circle>
                                                        </svg>
                                                    ) : (
                                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <circle cx="5.5" cy="17.5" r="3.5"></circle>
                                                            <circle cx="18.5" cy="17.5" r="3.5"></circle>
                                                            <path d="M15 6h4l3 7"></path>
                                                            <path d="M5.5 14H12l3-6H8.5"></path>
                                                        </svg>
                                                    )}
                                                </div>
                                            )}
                                            <div style={styles.vehicleInfo}>
                                                <div style={styles.vehicleHeaderRow}>
                                                    <h3 style={styles.vehicleCardTitle}>{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                                                </div>
                                                <span style={styles.typeBadge}>{vehicle.type}</span>
                                                {vehicle.description && <p style={styles.vehicleDesc}>{vehicle.description}</p>}
                                            </div>
                                        </div>

                                        <div style={styles.cardActions}>
                                            <button 
                                                onClick={() => openEditModal(vehicle)} 
                                                style={styles.editCardBtn}
                                                type="button"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => promptDeleteVehicle(vehicle)} 
                                                style={styles.deleteCardBtn}
                                                type="button"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Dashboard Section */}
                        <h2 style={styles.sectionTitle}>Dashboard</h2>
                        <div style={styles.dashboardGrid}>
                            {/* Upcoming Card */}
                            <div style={styles.alertCardUpcoming}>
                                <div style={styles.alertCardHeader}>
                                    <div style={styles.headerTitleGroup}>
                                        <span style={styles.dotUpcoming} />
                                        <h3 style={styles.alertCardTitleUpcoming}>Upcoming Maintenance</h3>
                                    </div>
                                    <span style={styles.badgeUpcoming}>{upcomingAlerts.length}</span>
                                </div>
                                <div style={styles.alertList}>
                                    {upcomingAlerts.length === 0 ? (
                                        <p style={styles.emptyAlertText}>No upcoming maintenance due in the next 15 days or 1,000 km.</p>
                                    ) : (
                                        upcomingAlerts.map((item, idx) => (
                                            <Link key={idx} href={`/vehicles/${item.vehicleId}`} style={styles.alertRow}>
                                                <div style={styles.alertRowLeft}>
                                                    <span style={styles.vehicleNameTag}>{item.vehicleName}</span>
                                                    <span style={styles.serviceNameText}>{item.serviceName}</span>
                                                </div>
                                                <span style={styles.triggerTextUpcoming}>{item.triggerText}</span>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Past Due Card */}
                            <div style={styles.alertCardPastDue}>
                                <div style={styles.alertCardHeader}>
                                    <div style={styles.headerTitleGroup}>
                                        <span style={styles.dotPastDue} />
                                        <h3 style={styles.alertCardTitlePastDue}>Past Due Maintenance</h3>
                                    </div>
                                    <span style={styles.badgePastDue}>{pastDueAlerts.length}</span>
                                </div>
                                <div style={styles.alertList}>
                                    {pastDueAlerts.length === 0 ? (
                                        <p style={styles.emptyAlertText}>No past due maintenance records. All up to date!</p>
                                    ) : (
                                        pastDueAlerts.map((item, idx) => (
                                            <Link key={idx} href={`/vehicles/${item.vehicleId}`} style={styles.alertRow}>
                                                <div style={styles.alertRowLeft}>
                                                    <span style={styles.vehicleNameTag}>{item.vehicleName}</span>
                                                    <span style={styles.serviceNameText}>{item.serviceName}</span>
                                                </div>
                                                <span style={styles.triggerTextPastDue}>{item.triggerText}</span>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    {showModal && (
                        <div style={styles.modalOverlay} className="animated-overlay">
                            <div style={styles.modalBox} className="animated-modal">
                                <div style={styles.modalHeader}>
                                    <h3 style={styles.modalTitle}>{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</h3>
                                    <button onClick={() => setShowModal(false)} style={styles.closeBtn} type="button">✕</button>
                                </div>

                                <form onSubmit={handleSubmit} style={styles.form}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Vehicle Type *</label>
                                        <select value={data.type} onChange={e => setData('type', e.target.value)} style={styles.input}>
                                            <option value="Car">🚗 Car</option>
                                            <option value="Motorbike">🏍️ Motorbike</option>
                                        </select>
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Make *</label>
                                        <input type="text" placeholder="e.g. Toyota" value={data.make} onChange={e => setData('make', e.target.value)} style={styles.input} />
                                        {errors.make && <span style={styles.error}>{errors.make}</span>}
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Model *</label>
                                        <input type="text" placeholder="e.g. Civic" value={data.model} onChange={e => setData('model', e.target.value)} style={styles.input} />
                                        {errors.model && <span style={styles.error}>{errors.model}</span>}
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Year *</label>
                                        <input type="text" placeholder="e.g. 2022" value={data.year} onChange={e => setData('year', e.target.value)} style={styles.input} />
                                        {errors.year && <span style={styles.error}>{errors.error}</span>}
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Description (Optional)</label>
                                        <textarea placeholder="Additional notes..." value={data.description} onChange={e => setData('description', e.target.value)} style={{ ...styles.input, height: '50px', resize: 'none' }} />
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Photo (Optional - Max 2100 KB)</label>
                                        <div style={styles.uploadBoxWrapper}>
                                            <div style={styles.uploadBox} onClick={() => fileInputRef.current?.click()}>
                                                <span style={styles.uploadText}>
                                                    {data.photo ? data.photo.name : (editingVehicle?.photo && !removeExistingPhoto) ? 'Current photo attached' : 'Click to upload'}
                                                </span>
                                            </div>
                                            {((data.photo) || (editingVehicle?.photo && !removeExistingPhoto)) && (
                                                <button 
                                                    type="button" 
                                                    onClick={handleRemovePhotoClick} 
                                                    style={styles.removePhotoBtn}
                                                    title="Remove photo"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                                        {errors.photo && <span style={styles.error}>{errors.photo}</span>}
                                    </div>

                                    <div style={styles.modalActions}>
                                        <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancel</button>
                                        <button type="submit" style={styles.saveBtn} disabled={processing}>Save</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {showDeleteModal && (
                        <div style={styles.modalOverlay} className="animated-overlay">
                            <div style={styles.modalBox} className="animated-modal">
                                <div style={styles.modalHeader}>
                                    <h3 style={styles.modalTitle}>Delete Vehicle</h3>
                                    <button onClick={() => setShowDeleteModal(false)} style={styles.closeBtn} type="button">✕</button>
                                </div>
                                <p style={{ color: '#c9d1d9', fontSize: '13px', margin: '8px 0 16px 0' }}>
                                    Are you sure you want to delete <strong style={{ color: '#ffffff' }}>{vehicleToDelete?.make} {vehicleToDelete?.model}</strong>? This action cannot be undone.
                                </p>
                                <div style={styles.modalActions}>
                                    <button type="button" onClick={() => setShowDeleteModal(false)} style={styles.cancelBtn}>Cancel</button>
                                    <button type="button" onClick={confirmDeleteVehicle} style={styles.deleteCardBtn}>Delete</button>
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
        width: '100%', maxWidth: '1280px', height: '100%', maxHeight: '820px',
        backgroundColor: '#161b22', borderRadius: '16px', display: 'flex', overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', border: '1px solid #21262d',
    },
    mainContent: { flex: 1, backgroundColor: '#0d1117', overflowY: 'auto', padding: '24px 36px', display: 'flex', flexDirection: 'column', position: 'relative', alignItems: 'center' },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', width: '100%', maxWidth: '900px' },
    breadcrumb: { fontSize: '12px', color: '#8b949e' },
    pageHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
    addButton: { backgroundColor: '#1f6feb', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
    contentBody: { display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px', width: '100%', paddingBottom: '30px', margin: '0 auto' },
    pageTitle: { fontSize: '26px', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.5px', margin: 0 },
    sectionTitle: { fontSize: '18px', fontWeight: '600', color: '#ffffff', margin: '4px 0 0 0' },
    
    // Dashboard Cards Grid
    dashboardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', width: '100%' },
    alertCardUpcoming: {
        backgroundColor: '#161b22', border: '1px solid rgba(210, 153, 34, 0.3)', borderRadius: '12px',
        padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
    },
    alertCardPastDue: {
        backgroundColor: '#161b22', border: '1px solid rgba(248, 81, 73, 0.3)', borderRadius: '12px',
        padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
    },
    alertCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    headerTitleGroup: { display: 'flex', alignItems: 'center', gap: '8px' },
    dotUpcoming: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#d29922' },
    dotPastDue: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f85149' },
    alertCardTitleUpcoming: { fontSize: '14px', fontWeight: '600', color: '#d29922', margin: 0 },
    alertCardTitlePastDue: { fontSize: '14px', fontWeight: '600', color: '#f85149', margin: 0 },
    badgeUpcoming: { backgroundColor: 'rgba(210, 153, 34, 0.2)', color: '#d29922', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' },
    badgePastDue: { backgroundColor: 'rgba(248, 81, 73, 0.2)', color: '#f85149', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' },
    alertList: { display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' },
    emptyAlertText: { fontSize: '12px', color: '#8b949e', fontStyle: 'italic', margin: 0, padding: '8px 0' },
    alertRow: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 10px', backgroundColor: '#0d1117', borderRadius: '6px', border: '1px solid #21262d',
        textDecoration: 'none', transition: 'background-color 0.15s'
    },
    alertRowLeft: { display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' },
    vehicleNameTag: { fontSize: '11px', fontWeight: '600', color: '#ffffff', backgroundColor: '#21262d', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 },
    serviceNameText: { fontSize: '12px', color: '#c9d1d9', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' },
    triggerTextUpcoming: { fontSize: '11px', color: '#d29922', fontWeight: '500', flexShrink: 0 },
    triggerTextPastDue: { fontSize: '11px', color: '#f85149', fontWeight: '500', flexShrink: 0 },

    vehicleGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '16px', paddingBottom: '10px', width: '100%' },
    emptyText: { color: '#8b949e', fontSize: '13px', margin: 0 },
    vehicleCard: {
        backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '12px',
        padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', width: '100%', boxSizing: 'border-box',
    },
    cardContentClickable: {
        display: 'flex', gap: '14px', alignItems: 'flex-start', cursor: 'pointer',
    },
    vehicleThumb: { width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, border: '1px solid #30363d' },
    placeholderThumb: { width: '56px', height: '56px', borderRadius: '8px', backgroundColor: '#0d1117', border: '1px solid #21262d', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
    vehicleInfo: { flex: 1, overflow: 'hidden' },
    vehicleHeaderRow: { display: 'flex', alignItems: 'center', marginBottom: '4px' },
    vehicleCardTitle: { color: '#ffffff', fontSize: '14px', fontWeight: '600', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    typeBadge: { display: 'inline-block', backgroundColor: '#1f6feb22', color: '#3b82f6', fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    vehicleDesc: { color: '#8b949e', fontSize: '12px', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' },
    cardActions: { display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #21262d', paddingTop: '12px' },
    editCardBtn: { backgroundColor: '#21262d', color: '#c9d1d9', border: '1px solid #30363d', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '500', cursor: 'pointer' },
    deleteCardBtn: { backgroundColor: '#da363322', color: '#f85149', border: '1px solid #30363d', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '500', cursor: 'pointer' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalBox: { backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '20px', width: '100%', maxWidth: '380px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    modalTitle: { color: '#ffffff', fontSize: '15px', fontWeight: '600', margin: 0 },
    closeBtn: { background: 'none', border: 'none', color: '#8b949e', fontSize: '16px', cursor: 'pointer' },
    form: { display: 'flex', flexDirection: 'column', gap: '10px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
    label: { color: '#8b949e', fontSize: '11px', fontWeight: '500' },
    input: { backgroundColor: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', padding: '6px 10px', color: '#ffffff', fontSize: '12px', outline: 'none', boxSizing: 'border-box' },
    uploadBoxWrapper: { display: 'flex', gap: '8px', alignItems: 'center' },
    uploadBox: { backgroundColor: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxSizing: 'border-box', flex: 1, overflow: 'hidden' },
    uploadText: { color: '#c9d1d9', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    removePhotoBtn: { backgroundColor: '#da363322', color: '#f85149', border: '1px solid #30363d', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '500', cursor: 'pointer', flexShrink: 0 },
    error: { color: '#f85149', fontSize: '11px' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' },
    cancelBtn: { backgroundColor: '#21262d', color: '#c9d1d9', border: '1px solid #30363d', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
    saveBtn: { backgroundColor: '#1f6feb', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
};