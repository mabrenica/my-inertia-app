import { useState, useRef, useEffect } from 'react';
import { Link, useForm, router } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import Toast from '@/Components/Toast';

export default function VehicleShow({ vehicle, servicePreferences = [], maintenanceLogs = [] }) {
    const photoUrl = vehicle.photo ? `/storage/${vehicle.photo}` : null;

    const [showLogModal, setShowLogModal] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    // Editing & Deleting States
    const [editingLogId, setEditingLogId] = useState(null);
    const [editForm, setEditForm] = useState({ date: '', service: '', odo: '', cost: '', notes: '' });
    const [deleteModalLog, setDeleteModalLog] = useState(null);
    
    // Multi-select dropdown state
    const [selectedServiceFilters, setSelectedServiceFilters] = useState([]);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowFilterDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get today's date in Philippine time (YYYY-MM-DD)
    const getPhilippineToday = () => {
        const options = { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' };
        const formatter = new Intl.DateTimeFormat('en-CA', options);
        return formatter.format(new Date());
    };

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        services: [],
        odo: '',
        date: getPhilippineToday(),
        cost: '',
        notes: '',
    });

    const openModal = () => {
        clearErrors();
        setData({
            services: [],
            odo: '',
            date: getPhilippineToday(),
            cost: '',
            notes: '',
        });
        setShowLogModal(true);
    };

    const closeModal = () => {
        setShowLogModal(false);
        reset();
    };

    const handleServiceToggle = (serviceName) => {
        if (data.services.includes(serviceName)) {
            setData('services', data.services.filter(s => s !== serviceName));
        } else {
            setData('services', [...data.services, serviceName]);
        }
    };

    const handleSubmitLog = (e) => {
        e.preventDefault();
        
        post(`/vehicles/${vehicle.id}/maintenance-logs`, {
            onSuccess: () => {
                closeModal();
                setToastMessage('Maintenance log added successfully!');
            },
        });
    };

    // Inline Edit Handlers
    const startEditing = (log) => {
        setEditingLogId(log.id);
        setEditForm({
            date: log.date || '',
            service: log.services && log.services.length > 0 ? log.services[0] : (servicePreferences[0]?.name || ''),
            odo: log.odo || '',
            cost: log.cost || '',
            notes: log.notes || '',
        });
    };

    const cancelEditing = () => {
        setEditingLogId(null);
        setEditForm({ date: '', service: '', odo: '', cost: '', notes: '' });
    };

    const saveEditing = (logId) => {
        router.put(`/maintenance-logs/${logId}`, {
            services: editForm.service ? [editForm.service] : [],
            odo: editForm.odo,
            date: editForm.date,
            cost: editForm.cost,
            notes: editForm.notes,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingLogId(null);
                setToastMessage('Maintenance log updated successfully!');
            }
        });
    };

    // Delete Handlers
    const confirmDelete = (log) => {
        setDeleteModalLog(log);
    };

    const handleDelete = () => {
        if (!deleteModalLog) return;
        router.delete(`/maintenance-logs/${deleteModalLog.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModalLog(null);
                setToastMessage('Maintenance log deleted successfully!');
            }
        });
    };

    // Helper to format date string to "Nov 10, 2026" style
    const formatDateToReadable = (dateStr) => {
        if (!dateStr || dateStr === '—' || dateStr === 'Never') return dateStr;
        const [year, month, day] = dateStr.split('-');
        if (!year || !month || !day) return dateStr;
        const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
        if (isNaN(dateObj.getTime())) return dateStr;
        return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Calculate Next Schedule for each service preference
    const serviceScheduleStatus = servicePreferences.map(pref => {
        const name = pref.name;
        const intervalDays = pref.interval_days ? Number(pref.interval_days) : null;
        const intervalOdo = pref.interval_odo ? Number(pref.interval_odo) : null;

        const matchingLogs = maintenanceLogs.filter(log => log.services && log.services.includes(name));

        let latestDate = null;
        let highestOdo = null;

        if (matchingLogs.length > 0) {
            const dates = matchingLogs.map(l => l.date).filter(Boolean).sort();
            if (dates.length > 0) {
                latestDate = dates[dates.length - 1];
            }

            const odos = matchingLogs.map(l => Number(l.odo)).filter(o => !isNaN(o));
            if (odos.length > 0) {
                highestOdo = Math.max(...odos);
            }
        }

        let nextDateStr = '—';
        if (latestDate && intervalDays) {
            const d = new Date(latestDate);
            d.setDate(d.getDate() + intervalDays);
            nextDateStr = d.toISOString().split('T')[0];
        }

        let nextOdoStr = '—';
        if (highestOdo !== null && intervalOdo !== null) {
            nextOdoStr = (highestOdo + intervalOdo).toLocaleString();
        }

        return {
            name,
            latestDate: latestDate || 'Never',
            highestOdo: highestOdo !== null ? highestOdo.toLocaleString() : 'Never',
            nextDate: formatDateToReadable(nextDateStr),
            nextOdo: nextOdoStr,
        };
    });

    const loggedServicesList = Array.from(
        new Set(
            maintenanceLogs.flatMap(log => log.services || [])
        )
    ).sort((a, b) => a.localeCompare(b));

    const handleFilterCheckboxToggle = (serviceName) => {
        if (selectedServiceFilters.includes(serviceName)) {
            setSelectedServiceFilters(selectedServiceFilters.filter(s => s !== serviceName));
        } else {
            setSelectedServiceFilters([...selectedServiceFilters, serviceName]);
        }
    };

    const clearFilters = (e) => {
        e.stopPropagation();
        setSelectedServiceFilters([]);
    };

    const filteredLogs = maintenanceLogs.filter(log => {
        if (selectedServiceFilters.length === 0) return true;
        return log.services && log.services.some(s => selectedServiceFilters.includes(s));
    });

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
                
                input[type="date"]::-webkit-calendar-picker-indicator {
                    filter: invert(100%) sepia(0%) saturate(7500%) hue-rotate(180deg) brightness(100%) contrast(100%);
                    cursor: pointer;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                }
                input[type="date"]::-webkit-calendar-picker-indicator:hover {
                    opacity: 1;
                }
                input[type="date"]::-webkit-inner-spin-button {
                    display: none;
                }
            `}</style>

            <div style={styles.appWindow}>
                <Sidebar activePage="home" />

                <div style={styles.mainContent}>
                    <Toast message={toastMessage} duration={3000} onClose={() => setToastMessage(null)} />

                    <div style={styles.topBar}>
                        <div style={styles.breadcrumb}>
                            <Link href="/home" style={styles.breadcrumbLink}>Main / Home</Link> / <span style={{ color: '#ffffff', fontWeight: '500' }}>{vehicle.make} {vehicle.model}</span>
                        </div>
                        <Link href="/home" style={styles.backButton}>
                            ← Back to Rides
                        </Link>
                    </div>

                    <div style={styles.contentBody}>
                        {/* Compact Vehicle Profile Card */}
                        <div style={styles.profileCard}>
                            <div style={styles.profileLeft}>
                                {photoUrl ? (
                                    <div 
                                        style={styles.photoThumbContainer} 
                                        onClick={() => setShowPhotoModal(true)}
                                        title="Click to view full size"
                                    >
                                        <img src={photoUrl} alt={vehicle.make} style={styles.vehicleThumb} />
                                        <div style={styles.photoOverlay}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="11" cy="11" r="8"></circle>
                                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                                <line x1="11" y1="8" x2="11" y2="14"></line>
                                                <line x1="8" y1="11" x2="14" y2="11"></line>
                                            </svg>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={styles.placeholderThumb}>
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2.5-4.5c-.3-.5-.9-.8-1.5-.8H10c-.6 0-1.2.3-1.5.8L6 10l-2.5 1.1C2.7 12.3 2 13.1 2 14v3c0 .6.4 1 1 1h2"></path>
                                            <circle cx="7" cy="17" r="2"></circle>
                                            <circle cx="17" cy="17" r="2"></circle>
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <div style={styles.profileRight}>
                                <div style={styles.detailItem}>
                                    <span style={styles.detailKey}>Type:</span>
                                    <span style={styles.typeBadge}>{vehicle.type}</span>
                                </div>
                                <div style={styles.detailItem}>
                                    <span style={styles.detailKey}>Make:</span>
                                    <span style={styles.detailVal}>{vehicle.make}</span>
                                </div>
                                <div style={styles.detailItem}>
                                    <span style={styles.detailKey}>Model:</span>
                                    <span style={styles.detailVal}>{vehicle.model}</span>
                                </div>
                                <div style={styles.detailItem}>
                                    <span style={styles.detailKey}>Year:</span>
                                    <span style={styles.detailVal}>{vehicle.year}</span>
                                </div>
                                <div style={styles.detailItem}>
                                    <span style={styles.detailKey}>Description:</span>
                                    <span style={styles.detailVal}>{vehicle.description || '—'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Service Schedule Status Section */}
                        <div style={styles.sectionHeaderRow}>
                            <h2 style={styles.sectionTitle}>Service Schedule Status</h2>
                        </div>

                        <div style={styles.tableContainer}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.tableHeaderRow}>
                                        <th style={styles.th}>List of Services</th>
                                        <th style={styles.th}>Next Service Schedule (Date)</th>
                                        <th style={styles.th}>Next Service Schedule (ODO)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {serviceScheduleStatus.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" style={styles.emptyTableCell}>
                                                No services configured in settings.
                                            </td>
                                        </tr>
                                    ) : (
                                        serviceScheduleStatus.map((item, idx) => (
                                            <tr key={idx} style={styles.tableBodyRow}>
                                                <td style={styles.td}>
                                                    <span style={styles.serviceBadge}>{item.name}</span>
                                                </td>
                                                <td style={styles.td}>{item.nextDate}</td>
                                                <td style={styles.td}>{item.nextOdo}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Maintenance Logs Section & Multi-Select Dropdown Filter */}
                        <div style={styles.sectionHeaderRow}>
                            <h2 style={styles.sectionTitle}>Maintenance Logs</h2>
                            
                            <div style={styles.dropdownWrapper} ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                    style={styles.dropdownToggleBtn}
                                >
                                    <span>
                                        {selectedServiceFilters.length === 0
                                            ? 'Filter Services'
                                            : `Services (${selectedServiceFilters.length})`}
                                    </span>
                                    <div style={styles.dropdownToggleRight}>
                                        {selectedServiceFilters.length > 0 && (
                                            <span 
                                                onClick={clearFilters} 
                                                style={styles.clearIconBadge}
                                                title="Clear filters"
                                            >
                                                ✕
                                            </span>
                                        )}
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </div>
                                </button>

                                {showFilterDropdown && (
                                    <div style={styles.dropdownMenu}>
                                        <div style={styles.dropdownHeader}>
                                            <span style={styles.dropdownTitle}>Filter by Service</span>
                                            {selectedServiceFilters.length > 0 && (
                                                <button type="button" onClick={clearFilters} style={styles.dropdownClearText}>
                                                    Clear All
                                                </button>
                                            )}
                                        </div>
                                        <div style={styles.dropdownList}>
                                            {loggedServicesList.length === 0 ? (
                                                <span style={styles.dropdownEmpty}>No logged services available.</span>
                                            ) : (
                                                loggedServicesList.map((serviceName, idx) => {
                                                    const isChecked = selectedServiceFilters.includes(serviceName);
                                                    return (
                                                        <label key={idx} style={styles.dropdownItemLabel}>
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => handleFilterCheckboxToggle(serviceName)}
                                                                style={styles.dropdownCheckbox}
                                                            />
                                                            {serviceName}
                                                        </label>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={styles.tableContainer}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.tableHeaderRow}>
                                        <th style={styles.th}>Date</th>
                                        <th style={styles.th}>Service</th>
                                        <th style={styles.th}>ODO</th>
                                        <th style={styles.th}>Cost</th>
                                        <th style={styles.th}>Notes</th>
                                        <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={styles.emptyTableCell}>
                                                No maintenance records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredLogs.map((log) => {
                                            const isEditing = editingLogId === log.id;
                                            return (
                                                <tr key={log.id} style={styles.tableBodyRow}>
                                                    {/* Date Column */}
                                                    <td style={styles.td}>
                                                        {isEditing ? (
                                                            <input 
                                                                type="date"
                                                                value={editForm.date}
                                                                onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                                                                style={styles.inlineInput}
                                                            />
                                                        ) : (
                                                            formatDateToReadable(log.date)
                                                        )}
                                                    </td>

                                                    {/* Service Column */}
                                                    <td style={styles.td}>
                                                        {isEditing ? (
                                                            <select
                                                                value={editForm.service}
                                                                onChange={e => setEditForm({ ...editForm, service: e.target.value })}
                                                                style={styles.inlineSelect}
                                                            >
                                                                <option value="">Select Service</option>
                                                                {servicePreferences.map((pref, pIdx) => (
                                                                    <option key={pIdx} value={pref.name}>{pref.name}</option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <div style={styles.serviceBadgeList}>
                                                                {log.services && log.services.map((srv, i) => (
                                                                    <span key={i} style={styles.serviceBadge}>{srv}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* ODO Column */}
                                                    <td style={styles.td}>
                                                        {isEditing ? (
                                                            <input 
                                                                type="text"
                                                                value={editForm.odo}
                                                                onChange={e => {
                                                                    const val = e.target.value;
                                                                    if (/^\d*$/.test(val)) setEditForm({ ...editForm, odo: val });
                                                                }}
                                                                style={styles.inlineInput}
                                                            />
                                                        ) : (
                                                            log.odo
                                                        )}
                                                    </td>

                                                    {/* Cost Column */}
                                                    <td style={styles.td}>
                                                        {isEditing ? (
                                                            <input 
                                                                type="text"
                                                                value={editForm.cost}
                                                                onChange={e => {
                                                                    const val = e.target.value;
                                                                    if (/^\d*\.?\d*$/.test(val)) setEditForm({ ...editForm, cost: val });
                                                                }}
                                                                style={styles.inlineInput}
                                                            />
                                                        ) : (
                                                            log.cost ? `₱${Number(log.cost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'
                                                        )}
                                                    </td>

                                                    {/* Notes Column */}
                                                    <td style={styles.td}>
                                                        {isEditing ? (
                                                            <input 
                                                                type="text"
                                                                value={editForm.notes}
                                                                onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                                                                style={styles.inlineInput}
                                                            />
                                                        ) : (
                                                            log.notes || '—'
                                                        )}
                                                    </td>

                                                    {/* Actions Column */}
                                                    <td style={{ ...styles.td, textAlign: 'right' }}>
                                                        <div style={styles.actionIconsGroup}>
                                                            {isEditing ? (
                                                                <>
                                                                    <button 
                                                                        onClick={() => saveEditing(log.id)}
                                                                        style={styles.iconActionBtn}
                                                                        title="Save changes"
                                                                        type="button"
                                                                    >
                                                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#238636" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                            <polyline points="20 6 9 17 4 12"></polyline>
                                                                        </svg>
                                                                    </button>
                                                                    <button 
                                                                        onClick={cancelEditing}
                                                                        style={styles.iconActionBtn}
                                                                        title="Cancel"
                                                                        type="button"
                                                                    >
                                                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8b949e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                                                        </svg>
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button 
                                                                        onClick={() => startEditing(log)}
                                                                        style={styles.iconActionBtn}
                                                                        title="Edit log"
                                                                        type="button"
                                                                    >
                                                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8b949e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                                        </svg>
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => confirmDelete(log)}
                                                                        style={styles.iconActionDeleteBtn}
                                                                        title="Delete log"
                                                                        type="button"
                                                                    >
                                                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f85149" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                            <polyline points="3 6 5 6 21 6"></polyline>
                                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                                        </svg>
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Sticky Floating Plus Action Button */}
                    <button 
                        onClick={openModal} 
                        style={styles.floatingBtn}
                        title="Add Maintenance Log"
                        type="button"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>

                    {/* Full-Size Photo Modal */}
                    {showPhotoModal && photoUrl && (
                        <div style={styles.modalOverlay} className="animated-overlay" onClick={() => setShowPhotoModal(false)}>
                            <div style={styles.fullPhotoBox} className="animated-modal" onClick={e => e.stopPropagation()}>
                                <button onClick={() => setShowPhotoModal(false)} style={styles.closePhotoBtn} type="button">✕</button>
                                <img src={photoUrl} alt={vehicle.make} style={styles.fullImage} />
                            </div>
                        </div>
                    )}

                    {/* Delete Confirmation Modal */}
                    {deleteModalLog && (
                        <div style={styles.modalOverlay} className="animated-overlay">
                            <div style={styles.confirmModalBox} className="animated-modal">
                                <h3 style={styles.modalTitle}>Delete Maintenance Log</h3>
                                <p style={styles.confirmText}>
                                    Are you sure you want to delete this maintenance record? This action cannot be undone.
                                </p>
                                <div style={styles.modalActions}>
                                    <button onClick={() => setDeleteModalLog(null)} style={styles.cancelBtn} type="button">
                                        Cancel
                                    </button>
                                    <button onClick={handleDelete} style={styles.deleteConfirmBtn} type="button">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add Maintenance Log Modal */}
                    {showLogModal && (
                        <div style={styles.modalOverlay} className="animated-overlay">
                            <div style={styles.modalBox} className="animated-modal">
                                <div style={styles.modalHeader}>
                                    <h3 style={styles.modalTitle}>Add Maintenance Log</h3>
                                    <button onClick={closeModal} style={styles.closeBtn} type="button">✕</button>
                                </div>

                                <form onSubmit={handleSubmitLog} style={styles.form}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Services Done * (Select one or more)</label>
                                        <div style={styles.checkboxContainer}>
                                            {servicePreferences.length === 0 ? (
                                                <span style={styles.noServiceText}>No services configured in settings.</span>
                                            ) : (
                                                servicePreferences.map((service, idx) => (
                                                    <label key={idx} style={styles.checkboxLabel}>
                                                        <input 
                                                            type="checkbox"
                                                            checked={data.services.includes(service.name)}
                                                            onChange={() => handleServiceToggle(service.name)}
                                                            style={styles.checkboxInput}
                                                        />
                                                        {service.name}
                                                    </label>
                                                ))
                                            )}
                                        </div>
                                        {errors.services && <span style={styles.errorText}>{errors.services}</span>}
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Odometer (ODO) (miles/km) *</label>
                                        <input 
                                            type="text"
                                            placeholder="e.g. 45000"
                                            value={data.odo}
                                            onChange={e => {
                                                const val = e.target.value;
                                                if (/^\d*$/.test(val)) {
                                                    setData('odo', val);
                                                }
                                            }}
                                            style={styles.input}
                                            required
                                        />
                                        {errors.odo && <span style={styles.errorText}>{errors.odo}</span>}
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Date *</label>
                                        <input 
                                            type="date"
                                            value={data.date}
                                            onChange={e => setData('date', e.target.value)}
                                            style={styles.input}
                                            required
                                        />
                                        {errors.date && <span style={styles.errorText}>{errors.date}</span>}
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Cost (PHP)</label>
                                        <div style={styles.currencyWrapper}>
                                            <span style={styles.currencySymbol}>₱</span>
                                            <input 
                                                type="text"
                                                placeholder="0.00"
                                                value={data.cost}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    if (/^\d*\.?\d*$/.test(val)) {
                                                        setData('cost', val);
                                                    }
                                                }}
                                                style={{ ...styles.input, paddingLeft: '26px' }}
                                            />
                                        </div>
                                        {errors.cost && <span style={styles.errorText}>{errors.cost}</span>}
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Notes (Optional)</label>
                                        <textarea 
                                            placeholder="Mechanic notes, workshop details..."
                                            value={data.notes}
                                            onChange={e => setData('notes', e.target.value)}
                                            style={{ ...styles.input, height: '60px', resize: 'none' }}
                                        />
                                        {errors.notes && <span style={styles.errorText}>{errors.notes}</span>}
                                    </div>

                                    <div style={styles.modalActions}>
                                        <button type="button" onClick={closeModal} style={styles.cancelBtn}>
                                            Cancel
                                        </button>
                                        <button type="submit" style={styles.saveBtn} disabled={processing}>
                                            {processing ? 'Saving...' : 'Save Log'}
                                        </button>
                                    </div>
                                </form>
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
        position: 'relative',
    },
    mainContent: { flex: 1, backgroundColor: '#0d1117', overflowY: 'auto', padding: '24px 36px', display: 'flex', flexDirection: 'column', position: 'relative' },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    breadcrumb: { fontSize: '12px', color: '#8b949e' },
    breadcrumbLink: { color: '#8b949e', textDecoration: 'none' },
    backButton: { backgroundColor: '#21262d', color: '#c9d1d9', border: '1px solid #30363d', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', textDecoration: 'none' },
    contentBody: { display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '850px', paddingBottom: '60px' },
    
    // Minimalist Vehicle Profile Card Styles
    profileCard: { 
        backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '12px', 
        padding: '20px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', display: 'flex', alignItems: 'center', gap: '24px' 
    },
    profileLeft: { flexShrink: 0 },
    photoThumbContainer: { 
        width: '120px', height: '90px', borderRadius: '8px', overflow: 'hidden', 
        backgroundColor: '#0d1117', border: '1px solid #30363d', position: 'relative', cursor: 'pointer',
        display: 'flex', justifyContent: 'center', alignItems: 'center'
    },
    vehicleThumb: { width: '100%', height: '100%', objectFit: 'cover' },
    photoOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center',
        opacity: 0, transition: 'opacity 0.2s ease',
    },
    placeholderThumb: { 
        width: '120px', height: '90px', borderRadius: '8px', backgroundColor: '#0d1117', 
        border: '1px solid #30363d', display: 'flex', justifyContent: 'center', alignItems: 'center' 
    },
    profileRight: { flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' },
    detailItem: { display: 'flex', alignItems: 'center', fontSize: '13px', gap: '8px' },
    detailKey: { color: '#8b949e', fontWeight: '500', width: '85px', flexShrink: 0 },
    detailVal: { color: '#ffffff', fontWeight: '500' },
    typeBadge: { display: 'inline-block', backgroundColor: '#1f6feb22', color: '#3b82f6', fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' },

    // Full Size Photo Modal Styles
    fullPhotoBox: {
        backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '12px',
        padding: '16px', maxWidth: '85vw', maxHeight: '85vh', position: 'relative',
        display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.8)'
    },
    fullImage: { maxWidth: '100%', maxHeight: '75vh', borderRadius: '8px', objectFit: 'contain' },
    closePhotoBtn: {
        position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)',
        border: '1px solid #30363d', color: '#ffffff', width: '28px', height: '28px', borderRadius: '50%',
        display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', zIndex: 10
    },

    // Multi-Select Dropdown Filter Styles
    sectionHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' },
    sectionTitle: { fontSize: '18px', fontWeight: '600', color: '#ffffff', margin: 0 },
    dropdownWrapper: { position: 'relative' },
    dropdownToggleBtn: {
        backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '6px',
        padding: '7px 14px', color: '#ffffff', fontSize: '12px', fontWeight: '500',
        display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', outline: 'none',
        minWidth: '150px', justifyContent: 'space-between'
    },
    dropdownToggleRight: { display: 'flex', alignItems: 'center', gap: '8px' },
    clearIconBadge: {
        backgroundColor: '#f8514933', color: '#f85149', fontSize: '10px', fontWeight: '700',
        width: '16px', height: '16px', borderRadius: '50%', display: 'flex', justifyContent: 'center',
        alignItems: 'center', cursor: 'pointer',
    },
    dropdownMenu: {
        position: 'absolute', right: 0, top: 'calc(100% + 6px)', width: '220px',
        backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', flexDirection: 'column',
        overflow: 'hidden'
    },
    dropdownHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 12px', borderBottom: '1px solid #21262d', backgroundColor: '#21262d55'
    },
    dropdownTitle: { fontSize: '11px', fontWeight: '600', color: '#8b949e', textTransform: 'uppercase' },
    dropdownClearText: { background: 'none', border: 'none', color: '#f85149', fontSize: '11px', cursor: 'pointer', fontWeight: '600' },
    dropdownList: { padding: '6px', display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '180px', overflowY: 'auto' },
    dropdownItemLabel: {
        display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '4px',
        color: '#c9d1d9', fontSize: '12px', cursor: 'pointer',
    },
    dropdownCheckbox: { accentColor: '#1f6feb', width: '13px', height: '13px', cursor: 'pointer' },
    dropdownEmpty: { padding: '12px', textAlign: 'center', color: '#8b949e', fontSize: '12px', fontStyle: 'italic' },

    // Table Styles
    tableContainer: { backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' },
    tableHeaderRow: { backgroundColor: '#21262d', borderBottom: '1px solid #30363d', color: '#8b949e' },
    th: { padding: '10px 14px', fontWeight: '600', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' },
    tableBodyRow: { borderBottom: '1px solid #21262d', transition: 'background-color 0.15s' },
    td: { padding: '12px 14px', color: '#c9d1d9', verticalAlign: 'middle' },
    emptyTableCell: { padding: '24px', textAlign: 'center', color: '#8b949e', fontStyle: 'italic' },
    serviceBadgeList: { display: 'flex', flexWrap: 'wrap', gap: '4px' },
    serviceBadge: { backgroundColor: '#1f6feb22', color: '#3b82f6', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '600' },

    actionIconsGroup: { display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' },
    iconActionBtn: {
        backgroundColor: '#21262d', border: '1px solid #30363d', borderRadius: '6px',
        width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
    },
    iconActionDeleteBtn: {
        backgroundColor: '#21262d', border: '1px solid #30363d', borderRadius: '6px',
        width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
    },
    inlineInput: {
        backgroundColor: '#0d1117', border: '1px solid #30363d', borderRadius: '4px',
        padding: '4px 8px', color: '#ffffff', fontSize: '12px', width: '100%', outline: 'none', boxSizing: 'border-box'
    },
    inlineSelect: {
        backgroundColor: '#0d1117', border: '1px solid #30363d', borderRadius: '4px',
        padding: '4px 8px', color: '#ffffff', fontSize: '12px', width: '100%', outline: 'none', boxSizing: 'border-box'
    },

    // Fixed Sticky Floating Plus Button
    floatingBtn: {
        position: 'fixed', bottom: '40px', right: '48px', width: '56px', height: '56px',
        backgroundColor: '#1f6feb', color: '#ffffff', borderRadius: '50%', border: 'none',
        display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer',
        boxShadow: '0 8px 24px rgba(31, 111, 235, 0.5)', zIndex: 100,
        transition: 'transform 0.2s ease, background-color 0.2s ease',
    },
    modalOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
    },
    modalBox: {
        backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '12px',
        padding: '24px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '90vh', overflowY: 'auto',
    },
    confirmModalBox: {
        backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '12px',
        padding: '24px', width: '100%', maxWidth: '380px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column', gap: '16px',
    },
    confirmText: { color: '#8b949e', fontSize: '13px', lineHeight: '1.5', margin: 0 },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { color: '#ffffff', fontSize: '16px', fontWeight: '600', margin: 0 },
    closeBtn: { background: 'none', border: 'none', color: '#8b949e', fontSize: '16px', cursor: 'pointer' },
    form: { display: 'flex', flexDirection: 'column', gap: '12px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { color: '#8b949e', fontSize: '11px', fontWeight: '500' },
    input: {
        backgroundColor: '#0d1117', border: '1px solid #30363d', borderRadius: '6px',
        padding: '8px 10px', color: '#ffffff', fontSize: '12px', outline: 'none', boxSizing: 'border-box', width: '100%',
    },
    checkboxContainer: {
        backgroundColor: '#0d1117', border: '1px solid #30363d', borderRadius: '6px',
        padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '140px', overflowY: 'auto',
    },
    checkboxLabel: {
        display: 'flex', alignItems: 'center', gap: '8px', color: '#c9d1d9', fontSize: '12px', cursor: 'pointer',
    },
    checkboxInput: { accentColor: '#1f6feb', width: '14px', height: '14px', cursor: 'pointer' },
    noServiceText: { color: '#8b949e', fontSize: '12px', fontStyle: 'italic', textAlign: 'center' },
    currencyWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    currencySymbol: { position: 'absolute', left: '10px', color: '#8b949e', fontSize: '12px', fontWeight: '600' },
    errorText: { color: '#f85149', fontSize: '11px', marginTop: '2px' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #21262d', paddingTop: '14px', marginTop: '4px' },
    cancelBtn: { backgroundColor: 'transparent', color: '#8b949e', border: '1px solid #30363d', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' },
    saveBtn: { backgroundColor: '#1f6feb', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
    deleteConfirmBtn: { backgroundColor: '#f85149', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
};