import { useState, useRef, useEffect } from 'react';
import { useForm, router, usePage, Link } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import Toast from '@/Components/Toast';
import Breadcrumb from '@/Components/Breadcrumb';

function MinimalTypeIcon({ type, size = 16 }) {
    if (type === 'Car') {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1c1c1c"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0 }}
            >
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2.5-4.5c-.3-.5-.9-.8-1.5-.8H10c-.6 0-1.2.3-1.5.8L6 10l-2.5 1.1C2.7 12.3 2 13.1 2 14v3c0 .6.4 1 1 1h2"></path>
                <circle cx="7" cy="17" r="2"></circle>
                <circle cx="17" cy="17" r="2"></circle>
            </svg>
        );
    }

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1c1c1c"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
        >
            <circle cx="5.5" cy="17.5" r="3.5"></circle>
            <circle cx="18.5" cy="17.5" r="3.5"></circle>
            <path d="M15 6h4l3 7"></path>
            <path d="M5.5 14H12l3-6H8.5"></path>
        </svg>
    );
}

function MobileVehicleTypeDropdown({ value, options = ['Car', 'Motorbike'], onChange }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        document.addEventListener('touchstart', handleOutside);
        return () => {
            document.removeEventListener('mousedown', handleOutside);
            document.removeEventListener('touchstart', handleOutside);
        };
    }, []);

    return (
        <div ref={containerRef} className={`home-mobile-type-select ${open ? 'is-open' : ''}`}>
            <button
                type="button"
                className={`home-mobile-type-trigger ${open ? 'is-focused' : ''}`}
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
            >
                <span className="home-mobile-type-value">
                    <MinimalTypeIcon type={value} size={16} />
                    <span>{value || 'Select type'}</span>
                </span>
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        flexShrink: 0,
                    }}
                >
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>

            {open && (
                <div className="home-mobile-type-popover" role="listbox">
                    {options.map((opt) => {
                        const isSelected = value === opt;
                        return (
                            <button
                                key={opt}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                className={`home-mobile-type-option ${isSelected ? 'is-selected' : ''}`}
                                onClick={() => {
                                    onChange(opt);
                                    setOpen(false);
                                }}
                            >
                                <span className="home-mobile-type-option-left">
                                    <MinimalTypeIcon type={opt} size={16} />
                                    <span>{opt}</span>
                                </span>
                                {isSelected && (
                                    <svg
                                        className="home-mobile-type-check"
                                        width="15"
                                        height="15"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

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

    const getVehiclePhotoUrl = (photo) => {
        if (!photo) return null;
        if (photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('data:')) {
            return photo;
        }
        return `/storage/${photo}`;
    };

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

            let nextDateStr = null;
            let dateStatus = null;
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

            let nextOdoVal = null;
            let odoStatus = null;
            if (highestOdo !== null && intervalOdo !== null && currentOdoNum !== null) {
                nextOdoVal = highestOdo + intervalOdo;
                const odoDiff = nextOdoVal - currentOdoNum;

                if (odoDiff <= 0) {
                    odoStatus = 'past_due';
                } else if (odoDiff <= 1000) {
                    odoStatus = 'upcoming';
                }
            }

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

    const renderVehicleTypeIcon = (type, size = 22) => {
        return <MinimalTypeIcon type={type} size={size} />;
    };

    const hasExistingPhoto = Boolean(editingVehicle?.photo && !removeExistingPhoto);

    return (
        <div style={styles.page} className="page-layout">
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
                    transform: translateY(-3px);
                    box-shadow: 0 10px 25px rgba(28, 28, 28, 0.08);
                    border-color: #b5b0a6;
                }
                .hover-list-item {
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .hover-list-item:hover {
                    transform: translateX(4px);
                    background-color: rgba(237, 230, 216, 0.8) !important;
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
                .mobile-ride-meta,
                .mobile-alert-card-list,
                .home-mobile-type-select {
                    display: none;
                }
                @media (max-width: 768px) {
                    .page-layout {
                        flex-direction: column !important;
                    }
                    .vehicleGrid {
                        grid-template-columns: 1fr !important;
                    }
                    .dashboardGrid {
                        grid-template-columns: 1fr !important;
                    }
                    .mainContent {
                        padding: 16px 16px 92px 16px !important;
                    }
                    .desktop-only-type-select {
                        display: none !important;
                    }
                    .home-mobile-type-select {
                        position: relative;
                        display: block;
                        width: 100%;
                    }
                    .home-mobile-type-trigger {
                        width: 100%;
                        background-color: #ffffff;
                        border: 1px solid #d6ccbb;
                        border-radius: 10px;
                        padding: 10px 12px;
                        color: #1c1c1c;
                        font-size: 13px;
                        font-weight: 500;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 8px;
                        cursor: pointer;
                        box-sizing: border-box;
                        box-shadow: 0 0 0 3px transparent;
                        transition: border-color 0.18s ease, box-shadow 0.18s ease;
                        text-align: left;
                    }
                    .home-mobile-type-trigger.is-focused {
                        border-color: #1c1c1c;
                        box-shadow: 0 0 0 3px rgba(28, 28, 28, 0.12);
                    }
                    .home-mobile-type-value {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                    .home-mobile-type-popover {
                        position: absolute;
                        top: calc(100% + 6px);
                        left: 0;
                        right: 0;
                        background-color: #ffffff;
                        border: 1px solid #d6ccbb;
                        border-radius: 12px;
                        padding: 8px 6px 8px 8px;
                        box-shadow: 0 12px 28px rgba(28, 28, 28, 0.14);
                        z-index: 80;
                        max-height: 220px;
                        overflow-y: auto;
                        display: flex;
                        flex-direction: column;
                        gap: 4px;
                        box-sizing: border-box;
                    }
                    .home-mobile-type-popover::-webkit-scrollbar {
                        width: 5px;
                    }
                    .home-mobile-type-popover::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .home-mobile-type-popover::-webkit-scrollbar-thumb {
                        background-color: #d6ccbb;
                        border-radius: 999px;
                    }
                    .home-mobile-type-option {
                        width: 100%;
                        background: transparent;
                        border: none;
                        border-radius: 8px;
                        padding: 9px 10px;
                        color: #1c1c1c;
                        font-size: 13px;
                        font-weight: 400;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 10px;
                        cursor: pointer;
                        text-align: left;
                        box-sizing: border-box;
                        transition: background-color 0.15s ease, color 0.15s ease;
                    }
                    .home-mobile-type-option:hover {
                        background-color: #ede6d8;
                    }
                    .home-mobile-type-option.is-selected {
                        background-color: #ede6d8;
                        color: #1c1c1c;
                        font-weight: 600;
                    }
                    .home-mobile-type-option-left {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        flex: 1;
                    }
                    .home-mobile-type-check {
                        color: #1c1c1c;
                        flex-shrink: 0;
                    }
                    .desktop-ride-content {
                        display: none !important;
                    }
                    .mobile-ride-meta {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                        cursor: pointer;
                    }
                    .mobile-ride-banner {
                        width: 100%;
                        height: 165px;
                        border-radius: 10px;
                        object-fit: cover;
                        border: 1px solid #d6ccbb;
                        display: block;
                    }
                    .mobile-ride-placeholder-banner {
                        width: 100%;
                        height: 130px;
                        border-radius: 10px;
                        background-color: #ede6d8;
                        border: 1px solid #d6ccbb;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-sizing: border-box;
                    }
                    .mobile-ride-header {
                        display: flex;
                        align-items: flex-start;
                        justify-content: space-between;
                        gap: 10px;
                    }
                    .mobile-ride-title {
                        font-size: 15px;
                        font-weight: 700;
                        color: #1c1c1c;
                        margin: 0;
                        line-height: 1.25;
                    }
                    .mobile-ride-rows {
                        display: flex;
                        flex-direction: column;
                        gap: 6px;
                        padding-top: 8px;
                        border-top: 1px solid #ede6d8;
                    }
                    .mobile-ride-row {
                        display: flex;
                        align-items: baseline;
                        justify-content: space-between;
                        gap: 12px;
                        font-size: 12px;
                    }
                    .mobile-ride-label {
                        color: #6e6962;
                        font-weight: 500;
                        flex-shrink: 0;
                    }
                    .mobile-ride-val {
                        color: #1c1c1c;
                        font-weight: 600;
                        text-align: right;
                        overflow-wrap: anywhere;
                    }
                    .desktop-alert-list {
                        display: none !important;
                    }
                    .mobile-alert-card-list {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    }
                    .mobile-alert-card {
                        background-color: #ede6d8;
                        border: 1px solid #d6ccbb;
                        border-radius: 10px;
                        padding: 12px;
                        text-decoration: none;
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                        box-sizing: border-box;
                    }
                    .mobile-alert-card-top {
                        display: flex;
                        align-items: flex-start;
                        justify-content: space-between;
                        gap: 8px;
                    }
                    .mobile-alert-service-title {
                        font-size: 13px;
                        font-weight: 700;
                        color: #1c1c1c;
                        margin: 0;
                        line-height: 1.3;
                    }
                    .mobile-alert-rows {
                        display: flex;
                        flex-direction: column;
                        gap: 4px;
                        padding-top: 6px;
                        border-top: 1px solid #d6ccbb;
                    }
                    .mobile-alert-row {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 10px;
                        font-size: 12px;
                    }
                    .mobile-alert-label {
                        color: #6e6962;
                        font-weight: 500;
                    }
                    .mobile-alert-val {
                        color: #1c1c1c;
                        font-weight: 600;
                        text-align: right;
                    }
                    .modalBox {
                        padding: 18px !important;
                        border-radius: 14px !important;
                        max-height: 88vh !important;
                        overflow-y: auto !important;
                    }
                }
            `}</style>

            <Sidebar activePage="home" />

            <div style={styles.mainContent} className="mainContent">
                <Toast message={toastMessage} duration={1000} onClose={() => setToastMessage(null)} />

                <Breadcrumb items={[{ label: 'Main', href: '#' }, { label: 'Home' }]} />

                <div style={styles.contentBody}>
                    <div style={styles.pageHeaderRow}>
                        <h1 style={styles.pageTitle}>My Rides</h1>
                        <button
                            onClick={openCreateModal}
                            style={styles.addButton}
                            className="hover-btn"
                            type="button"
                        >
                            + Add Vehicle
                        </button>
                    </div>

                    <div style={styles.vehicleGrid} className="vehicleGrid">
                        {vehicles.length === 0 ? (
                            <p style={styles.emptyText}>No vehicle records added yet. Click "+ Add Vehicle" to get started.</p>
                        ) : (
                            vehicles.map((vehicle) => {
                                const photoUrl = getVehiclePhotoUrl(vehicle.photo);
                                return (
                                    <div key={vehicle.id} style={styles.vehicleCard} className="interactive-card page-card-anim">
                                        {/* Desktop Ride Card Content */}
                                        <div
                                            style={styles.cardContentClickable}
                                            className="desktop-ride-content"
                                            onClick={() => router.visit(`/vehicles/${vehicle.id}`)}
                                        >
                                            {photoUrl ? (
                                                <img src={photoUrl} alt={vehicle.make} style={styles.vehicleThumb} />
                                            ) : (
                                                <div style={styles.placeholderThumb}>
                                                    {renderVehicleTypeIcon(vehicle.type, 22)}
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

                                        {/* Mobile Structured Ride Card */}
                                        <div
                                            className="mobile-ride-meta"
                                            onClick={() => router.visit(`/vehicles/${vehicle.id}`)}
                                        >
                                            {photoUrl ? (
                                                <img src={photoUrl} alt={vehicle.make} className="mobile-ride-banner" />
                                            ) : (
                                                <div className="mobile-ride-placeholder-banner">
                                                    {renderVehicleTypeIcon(vehicle.type, 30)}
                                                </div>
                                            )}

                                            <div className="mobile-ride-header">
                                                <h3 className="mobile-ride-title">{vehicle.make} {vehicle.model}</h3>
                                                <span style={{ ...styles.typeBadge, marginBottom: 0, flexShrink: 0 }}>{vehicle.type}</span>
                                            </div>

                                            <div className="mobile-ride-rows">
                                                <div className="mobile-ride-row">
                                                    <span className="mobile-ride-label">Year</span>
                                                    <span className="mobile-ride-val">{vehicle.year || '—'}</span>
                                                </div>
                                                <div className="mobile-ride-row">
                                                    <span className="mobile-ride-label">Description</span>
                                                    <span className="mobile-ride-val">{vehicle.description || '—'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={styles.cardActions}>
                                            <button
                                                onClick={() => openEditModal(vehicle)}
                                                style={styles.editCardBtn}
                                                className="hover-btn"
                                                type="button"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => promptDeleteVehicle(vehicle)}
                                                style={styles.deleteCardBtn}
                                                className="hover-btn"
                                                type="button"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <h2 style={styles.sectionTitle}>Dashboard</h2>
                    <div style={styles.dashboardGrid} className="dashboardGrid">
                        <div style={styles.alertCardUpcoming} className="interactive-card page-card-anim">
                            <div style={styles.alertCardHeader}>
                                <div style={styles.headerTitleGroup}>
                                    <span style={styles.dotUpcoming} />
                                    <h3 style={styles.alertCardTitleUpcoming}>Upcoming Maintenance</h3>
                                </div>
                                <span style={styles.badgeUpcoming}>{upcomingAlerts.length}</span>
                            </div>

                            {/* Desktop Alert List */}
                            <div style={styles.alertList} className="desktop-alert-list">
                                {upcomingAlerts.length === 0 ? (
                                    <p style={styles.emptyAlertText}>No upcoming maintenance due in the next 15 days or 1,000 km.</p>
                                ) : (
                                    upcomingAlerts.map((item, idx) => (
                                        <Link key={idx} href={`/vehicles/${item.vehicleId}`} style={styles.alertRow} className="hover-list-item">
                                            <div style={styles.alertRowLeft}>
                                                <span style={styles.vehicleNameTag}>{item.vehicleName}</span>
                                                <span style={styles.serviceNameText}>{item.serviceName}</span>
                                            </div>
                                            <span style={styles.triggerTextUpcoming}>{item.triggerText}</span>
                                        </Link>
                                    ))
                                )}
                            </div>

                            {/* Mobile Alert Card List */}
                            <div className="mobile-alert-card-list">
                                {upcomingAlerts.length === 0 ? (
                                    <p style={styles.emptyAlertText}>No upcoming maintenance due in the next 15 days or 1,000 km.</p>
                                ) : (
                                    upcomingAlerts.map((item, idx) => (
                                        <Link key={idx} href={`/vehicles/${item.vehicleId}`} className="mobile-alert-card">
                                            <div className="mobile-alert-card-top">
                                                <h4 className="mobile-alert-service-title">{item.serviceName}</h4>
                                                <span style={styles.badgeUpcoming}>Upcoming</span>
                                            </div>
                                            <div className="mobile-alert-rows">
                                                <div className="mobile-alert-row">
                                                    <span className="mobile-alert-label">Vehicle</span>
                                                    <span className="mobile-alert-val">{item.vehicleName}</span>
                                                </div>
                                                <div className="mobile-alert-row">
                                                    <span className="mobile-alert-label">Schedule</span>
                                                    <span style={styles.triggerTextUpcoming}>{item.triggerText}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>

                        <div style={styles.alertCardPastDue} className="interactive-card page-card-anim">
                            <div style={styles.alertCardHeader}>
                                <div style={styles.headerTitleGroup}>
                                    <span style={styles.dotPastDue} />
                                    <h3 style={styles.alertCardTitlePastDue}>Past Due Maintenance</h3>
                                </div>
                                <span style={styles.badgePastDue}>{pastDueAlerts.length}</span>
                            </div>

                            {/* Desktop Alert List */}
                            <div style={styles.alertList} className="desktop-alert-list">
                                {pastDueAlerts.length === 0 ? (
                                    <p style={styles.emptyAlertText}>No past due maintenance records. All up to date!</p>
                                ) : (
                                    pastDueAlerts.map((item, idx) => (
                                        <Link key={idx} href={`/vehicles/${item.vehicleId}`} style={styles.alertRow} className="hover-list-item">
                                            <div style={styles.alertRowLeft}>
                                                <span style={styles.vehicleNameTag}>{item.vehicleName}</span>
                                                <span style={styles.serviceNameText}>{item.serviceName}</span>
                                            </div>
                                            <span style={styles.triggerTextPastDue}>{item.triggerText}</span>
                                        </Link>
                                    ))
                                )}
                            </div>

                            {/* Mobile Alert Card List */}
                            <div className="mobile-alert-card-list">
                                {pastDueAlerts.length === 0 ? (
                                    <p style={styles.emptyAlertText}>No past due maintenance records. All up to date!</p>
                                ) : (
                                    pastDueAlerts.map((item, idx) => (
                                        <Link key={idx} href={`/vehicles/${item.vehicleId}`} className="mobile-alert-card">
                                            <div className="mobile-alert-card-top">
                                                <h4 className="mobile-alert-service-title">{item.serviceName}</h4>
                                                <span style={styles.badgePastDue}>Past Due</span>
                                            </div>
                                            <div className="mobile-alert-rows">
                                                <div className="mobile-alert-row">
                                                    <span className="mobile-alert-label">Vehicle</span>
                                                    <span className="mobile-alert-val">{item.vehicleName}</span>
                                                </div>
                                                <div className="mobile-alert-row">
                                                    <span className="mobile-alert-label">Schedule</span>
                                                    <span style={styles.triggerTextPastDue}>{item.triggerText}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {showModal && (
                    <div style={styles.modalOverlay} className="animated-overlay">
                        <div style={styles.modalBox} className="animated-modal modalBox">
                            <div style={styles.modalHeader}>
                                <h3 style={styles.modalTitle}>{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</h3>
                                <button onClick={() => setShowModal(false)} style={styles.closeBtn} type="button">✕</button>
                            </div>

                            <form onSubmit={handleSubmit} style={styles.form}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Vehicle Type *</label>
                                    <div className="desktop-only-type-select">
                                        <select value={data.type} onChange={e => setData('type', e.target.value)} style={styles.input}>
                                            <option value="Car">Car</option>
                                            <option value="Motorbike">Motorbike</option>
                                        </select>
                                    </div>
                                    <MobileVehicleTypeDropdown
                                        value={data.type}
                                        options={['Car', 'Motorbike']}
                                        onChange={(val) => setData('type', val)}
                                    />
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
                                    {errors.year && <span style={styles.error}>{errors.year}</span>}
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Description (Optional)</label>
                                    <textarea placeholder="Additional notes..." value={data.description} onChange={e => setData('description', e.target.value)} style={{ ...styles.input, height: '50px', resize: 'none' }} />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Photo (Optional - Max 2100 KB)</label>
                                    <div style={styles.uploadBoxWrapper}>
                                        <div style={styles.uploadBox} onClick={() => fileInputRef.current?.click()}>
                                            {data.photo ? (
                                                <span style={styles.uploadText}>{data.photo.name}</span>
                                            ) : hasExistingPhoto ? (
                                                <span style={styles.uploadIconOnly} aria-label="Uploaded photo" title="Uploaded photo">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1c1c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                                        <polyline points="21 15 16 10 5 21"></polyline>
                                                    </svg>
                                                </span>
                                            ) : (
                                                <span style={styles.uploadText}>Click to upload</span>
                                            )}
                                        </div>
                                        {((data.photo) || hasExistingPhoto) && (
                                            <button
                                                type="button"
                                                onClick={handleRemovePhotoClick}
                                                style={styles.removePhotoBtn}
                                                className="hover-btn"
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
                                    <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn} className="hover-btn">Cancel</button>
                                    <button type="submit" style={styles.saveBtn} className="hover-btn" disabled={processing}>Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showDeleteModal && (
                    <div style={styles.modalOverlay} className="animated-overlay">
                        <div style={styles.modalBox} className="animated-modal modalBox">
                            <div style={styles.modalHeader}>
                                <h3 style={styles.modalTitle}>Delete Vehicle</h3>
                                <button onClick={() => setShowDeleteModal(false)} style={styles.closeBtn} type="button">✕</button>
                            </div>
                            <p style={{ color: '#6e6962', fontSize: '13px', margin: '8px 0 16px 0' }}>
                                Are you sure you want to delete <strong style={{ color: '#1c1c1c' }}>{vehicleToDelete?.make} {vehicleToDelete?.model}</strong>? This action cannot be undone.
                            </p>
                            <div style={styles.modalActions}>
                                <button type="button" onClick={() => setShowDeleteModal(false)} style={styles.cancelBtn} className="hover-btn">Cancel</button>
                                <button type="button" onClick={confirmDeleteVehicle} style={styles.deleteCardBtn} className="hover-btn">Delete</button>
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
        backgroundColor: '#ede6d8', display: 'flex', flexDirection: 'row',
        margin: 0, padding: 0, boxSizing: 'border-box', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
    },
    mainContent: { flex: 1, backgroundColor: '#ede6d8', height: '100vh', overflowY: 'auto', padding: '24px 36px', display: 'flex', flexDirection: 'column', position: 'relative', alignItems: 'center', boxSizing: 'border-box' },
    contentBody: { display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px', width: '100%', paddingBottom: '30px', margin: '0 auto' },
    pageHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
    addButton: { backgroundColor: '#1c1c1c', color: '#ede6d8', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
    pageTitle: { fontSize: '26px', fontWeight: '700', color: '#1c1c1c', letterSpacing: '-0.5px', margin: 0 },
    sectionTitle: { fontSize: '18px', fontWeight: '600', color: '#1c1c1c', margin: '4px 0 0 0' },

    dashboardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', width: '100%' },
    alertCardUpcoming: {
        backgroundColor: '#ffffff', border: '1px solid #d6ccbb', borderRadius: '12px',
        padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 12px rgba(28, 28, 28, 0.04)'
    },
    alertCardPastDue: {
        backgroundColor: '#ffffff', border: '1px solid #d6ccbb', borderRadius: '12px',
        padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 12px rgba(28, 28, 28, 0.04)'
    },
    alertCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    headerTitleGroup: { display: 'flex', alignItems: 'center', gap: '8px' },
    dotUpcoming: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#eab308' },
    dotPastDue: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dc2626' },
    alertCardTitleUpcoming: { fontSize: '14px', fontWeight: '600', color: '#1c1c1c', margin: 0 },
    alertCardTitlePastDue: { fontSize: '14px', fontWeight: '600', color: '#1c1c1c', margin: 0 },
    badgeUpcoming: { backgroundColor: '#eab30824', color: '#854d0e', border: '1px solid #eab30866', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', flexShrink: 0 },
    badgePastDue: { backgroundColor: '#dc262618', color: '#dc2626', border: '1px solid #dc262644', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', flexShrink: 0 },
    alertList: { display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' },
    emptyAlertText: { fontSize: '12px', color: '#6e6962', fontStyle: 'italic', margin: 0, padding: '8px 0' },
    alertRow: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 10px', backgroundColor: '#ede6d8', borderRadius: '6px', border: '1px solid #d6ccbb',
        textDecoration: 'none',
    },
    alertRowLeft: { display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' },
    vehicleNameTag: { fontSize: '11px', fontWeight: '600', color: '#ede6d8', backgroundColor: '#1c1c1c', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 },
    serviceNameText: { fontSize: '12px', color: '#1c1c1c', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' },
    triggerTextUpcoming: { fontSize: '11px', color: '#854d0e', backgroundColor: '#eab30824', border: '1px solid #eab30866', padding: '2px 7px', borderRadius: '4px', fontWeight: '700', flexShrink: 0 },
    triggerTextPastDue: { fontSize: '11px', color: '#dc2626', backgroundColor: '#dc262618', border: '1px solid #dc262644', padding: '2px 7px', borderRadius: '4px', fontWeight: '700', flexShrink: 0 },

    vehicleGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px', paddingBottom: '10px', width: '100%' },
    emptyText: { color: '#6e6962', fontSize: '13px', margin: 0 },
    vehicleCard: {
        backgroundColor: '#ffffff', border: '1px solid #d6ccbb', borderRadius: '12px',
        padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px',
        boxShadow: '0 4px 12px rgba(28, 28, 28, 0.04)', width: '100%', boxSizing: 'border-box',
    },
    cardContentClickable: { display: 'flex', gap: '14px', alignItems: 'flex-start', cursor: 'pointer' },
    vehicleThumb: { width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, border: '1px solid #d6ccbb' },
    placeholderThumb: { width: '56px', height: '56px', borderRadius: '8px', backgroundColor: '#ede6d8', border: '1px solid #d6ccbb', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
    vehicleInfo: { flex: 1, overflow: 'hidden' },
    vehicleHeaderRow: { display: 'flex', alignItems: 'center', marginBottom: '4px' },
    vehicleCardTitle: { color: '#1c1c1c', fontSize: '14px', fontWeight: '600', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    typeBadge: { display: 'inline-block', backgroundColor: '#1c1c1c10', color: '#1c1c1c', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    vehicleDesc: { color: '#6e6962', fontSize: '12px', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' },
    cardActions: { display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #ede6d8', paddingTop: '12px' },
    editCardBtn: { backgroundColor: '#ede6d8', color: '#1c1c1c', border: '1px solid #d6ccbb', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '500', cursor: 'pointer' },
    deleteCardBtn: { backgroundColor: '#b3251e15', color: '#b3251e', border: '1px solid #d6ccbb', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '500', cursor: 'pointer' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(28, 28, 28, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px' },
    modalBox: { backgroundColor: '#ffffff', border: '1px solid #d6ccbb', borderRadius: '12px', padding: '20px', width: '100%', maxWidth: '380px', boxShadow: '0 20px 40px rgba(28, 28, 28, 0.2)', boxSizing: 'border-box' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    modalTitle: { color: '#1c1c1c', fontSize: '15px', fontWeight: '600', margin: 0 },
    closeBtn: { background: 'none', border: 'none', color: '#6e6962', fontSize: '16px', cursor: 'pointer' },
    form: { display: 'flex', flexDirection: 'column', gap: '10px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
    label: { color: '#6e6962', fontSize: '11px', fontWeight: '500' },
    input: { backgroundColor: '#ede6d8', border: '1px solid #d6ccbb', borderRadius: '6px', padding: '6px 10px', color: '#1c1c1c', fontSize: '12px', outline: 'none', boxSizing: 'border-box', width: '100%' },
    uploadBoxWrapper: { display: 'flex', gap: '8px', alignItems: 'center' },
    uploadBox: { backgroundColor: '#ede6d8', border: '1px solid #d6ccbb', borderRadius: '6px', padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxSizing: 'border-box', flex: 1, overflow: 'hidden', minHeight: '32px' },
    uploadText: { color: '#1c1c1c', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'left' },
    uploadIconOnly: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 },
    removePhotoBtn: { backgroundColor: '#b3251e15', color: '#b3251e', border: '1px solid #d6ccbb', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '500', cursor: 'pointer', flexShrink: 0 },
    error: { color: '#b3251e', fontSize: '11px' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' },
    cancelBtn: { backgroundColor: '#ede6d8', color: '#1c1c1c', border: '1px solid #d6ccbb', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
    saveBtn: { backgroundColor: '#1c1c1c', color: '#ede6d8', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
};
