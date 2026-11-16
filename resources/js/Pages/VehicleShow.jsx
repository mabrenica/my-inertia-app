import { useState, useRef, useEffect } from 'react';
import { Link, useForm, router } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import Toast from '@/Components/Toast';
import Breadcrumb from '@/Components/Breadcrumb';

function MobileSelectDropdown({
    value,
    options,
    placeholder = 'Select option',
    multiple = false,
    onChange,
    isInvalid = false,
    shakeKey = 0,
}) {
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

    const selectedValues = multiple
        ? (Array.isArray(value) ? value : [])
        : [];

    const triggerLabel = multiple
        ? (selectedValues.length === 0
            ? placeholder
            : selectedValues.length === 1
                ? selectedValues[0]
                : `${selectedValues.length} services selected`)
        : (value || placeholder);

    const handleOptionClick = (optValue) => {
        if (multiple) {
            const exists = selectedValues.includes(optValue);
            const updated = exists
                ? selectedValues.filter((item) => item !== optValue)
                : [...selectedValues, optValue];
            onChange(updated);
        } else {
            onChange(optValue);
            setOpen(false);
        }
    };

    return (
        <div ref={containerRef} className={`ref-mobile-select ${open ? 'is-open' : ''}`}>
            <button
                key={isInvalid ? `mobile-sel-${shakeKey}` : 'mobile-sel'}
                type="button"
                className={`ref-mobile-select-trigger ${open ? 'is-focused' : ''} ${isInvalid ? 'shake-invalid' : ''}`}
                style={isInvalid ? { borderColor: '#b3251e' } : undefined}
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
            >
                <span className="ref-mobile-select-value">
                    {triggerLabel}
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
                <div className="ref-mobile-popover" role="listbox" aria-multiselectable={multiple}>
                    {options.length === 0 ? (
                        <div className="ref-mobile-empty">No services configured in settings.</div>
                    ) : (
                        options.map((opt, idx) => {
                            const optValue = typeof opt === 'string' ? opt : opt.value;
                            const optLabel = typeof opt === 'string' ? opt : opt.label;
                            const isSelected = multiple
                                ? selectedValues.includes(optValue)
                                : value === optValue;

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    role="option"
                                    aria-selected={isSelected}
                                    className={`ref-mobile-option ${isSelected ? 'is-selected' : ''}`}
                                    onClick={() => handleOptionClick(optValue)}
                                >
                                    <span className="ref-mobile-option-label">{optLabel}</span>
                                    {isSelected && (
                                        <svg
                                            className="ref-mobile-check"
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
                        })
                    )}
                </div>
            )}
        </div>
    );
}

export default function VehicleShow({ vehicle, servicePreferences = [], maintenanceLogs = [] }) {
    const photoUrl = vehicle.photo
        ? (vehicle.photo.startsWith('http://') || vehicle.photo.startsWith('https://') || vehicle.photo.startsWith('data:')
            ? vehicle.photo
            : `/storage/${vehicle.photo}`)
        : null;

    const [showLogModal, setShowLogModal] = useState(false);
    const [showDeleteLogModal, setShowDeleteLogModal] = useState(false);
    const [logToDelete, setLogToDelete] = useState(null);

    const [editingLogId, setEditingLogId] = useState(null);
    const [inlineData, setInlineData] = useState({
        services: '',
        odo: '',
        date: '',
        cost: '',
        notes: '',
    });
    const [inlineEmptyFields, setInlineEmptyFields] = useState({});

    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [showOdoModal, setShowOdoModal] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    const [odoEmptyError, setOdoEmptyError] = useState(false);
    const [logEmptyFields, setLogEmptyFields] = useState({});
    const [shakeKey, setShakeKey] = useState(0);

    const triggerShake = () => setShakeKey((k) => k + 1);

    const clearLogEmptyError = (field) => {
        setLogEmptyFields((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const clearInlineEmptyError = (field) => {
        setInlineEmptyFields((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const { data: odoData, setData: setOdoData, put: putOdo, processing: odoProcessing, errors: odoErrors, reset: resetOdo, clearErrors: clearOdoErrors } = useForm({
        current_odo: vehicle.current_odo || '',
    });

    const openOdoModal = () => {
        clearOdoErrors();
        setOdoEmptyError(false);
        setOdoData('current_odo', vehicle.current_odo || '');
        setShowOdoModal(true);
    };

    const closeOdoModal = () => {
        setShowOdoModal(false);
        setOdoEmptyError(false);
        resetOdo();
    };

    const handleUpdateOdo = (e) => {
        e.preventDefault();
        if (!String(odoData.current_odo ?? '').trim()) {
            setOdoEmptyError(true);
            triggerShake();
            return;
        }
        setOdoEmptyError(false);
        putOdo(`/vehicles/${vehicle.id}/odo`, {
            preserveScroll: true,
            onSuccess: () => {
                closeOdoModal();
                setToastMessage('Current ODO updated successfully!');
            }
        });
    };

    const [selectedServiceFilters, setSelectedServiceFilters] = useState([]);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowFilterDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

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

    const openCreateModal = () => {
        clearErrors();
        setLogEmptyFields({});
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
        setLogEmptyFields({});
        reset();
    };

    const startEditingRow = (log) => {
        setInlineEmptyFields({});
        setEditingLogId(log.id);
        const currentService = (log.services && log.services.length > 0) ? log.services[0] : (servicePreferences[0]?.name || '');
        setInlineData({
            services: currentService,
            odo: log.odo || '',
            date: log.date || getPhilippineToday(),
            cost: log.cost !== null && log.cost !== undefined ? log.cost : '',
            notes: log.notes || '',
        });
    };

    const cancelEditingRow = () => {
        setInlineEmptyFields({});
        setEditingLogId(null);
    };

    const saveEditingRow = (logId) => {
        const missing = {};
        if (!String(inlineData.date || '').trim()) missing.date = true;
        if (!String(inlineData.services || '').trim()) missing.services = true;
        if (!String(inlineData.odo ?? '').trim()) missing.odo = true;

        setInlineEmptyFields(missing);
        if (Object.keys(missing).length > 0) {
            triggerShake();
            return;
        }

        router.put(`/maintenance-logs/${logId}`, {
            services: [inlineData.services],
            odo: inlineData.odo,
            date: inlineData.date,
            cost: inlineData.cost,
            notes: inlineData.notes,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setInlineEmptyFields({});
                setEditingLogId(null);
                setToastMessage('Maintenance log updated successfully!');
            },
        });
    };

    const promptDeleteLog = (log) => {
        setLogToDelete(log);
        setShowDeleteLogModal(true);
    };

    const confirmDeleteLog = () => {
        if (logToDelete) {
            router.delete(`/maintenance-logs/${logToDelete.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setShowDeleteLogModal(false);
                    setLogToDelete(null);
                    setToastMessage('Maintenance log deleted successfully!');
                },
            });
        }
    };

    const handleServiceToggle = (serviceName) => {
        const nextServices = data.services.includes(serviceName)
            ? data.services.filter(s => s !== serviceName)
            : [...data.services, serviceName];
        setData('services', nextServices);
        if (nextServices.length > 0) {
            clearLogEmptyError('services');
        }
    };

    const handleSubmitLog = (e) => {
        e.preventDefault();
        const missing = {};
        if (!Array.isArray(data.services) || data.services.length === 0) missing.services = true;
        if (!String(data.odo ?? '').trim()) missing.odo = true;
        if (!String(data.date || '').trim()) missing.date = true;

        setLogEmptyFields(missing);
        if (Object.keys(missing).length > 0) {
            triggerShake();
            return;
        }

        post(`/vehicles/${vehicle.id}/maintenance-logs`, {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                setToastMessage('Maintenance log added successfully!');
            },
        });
    };

    const formatDateToReadable = (dateStr) => {
        if (!dateStr || dateStr === '—' || dateStr === 'Never') return dateStr;
        const [year, month, day] = dateStr.split('-');
        if (!year || !month || !day) return dateStr;
        const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
        if (isNaN(dateObj.getTime())) return dateStr;
        return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTimestampToReadable = (timestamp) => {
        if (!timestamp) return null;
        const dateObj = new Date(timestamp);
        if (isNaN(dateObj.getTime())) return null;
        return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getOverallScheduleTag = (dateTag, odoTag) => {
        if (dateTag === 'past_due' || odoTag === 'past_due') return 'past_due';
        if (dateTag === 'upcoming' || odoTag === 'upcoming') return 'upcoming';
        return null;
    };

    const serviceScheduleStatus = servicePreferences.map(pref => {
        const name = pref.name;
        const intervalDays = pref.interval_days ? Number(pref.interval_days) : null;
        const intervalOdo = pref.interval_odo ? Number(pref.interval_odo) : null;

        const matchingLogs = maintenanceLogs.filter(log => log.services && log.services.includes(name));

        let latestDate = null;
        let highestOdo = null;

        if (matchingLogs.length > 0) {
            const dates = matchingLogs.map(l => l.date).filter(Boolean).sort();
            if (dates.length > 0) latestDate = dates[dates.length - 1];

            const odos = matchingLogs.map(l => Number(l.odo)).filter(o => !isNaN(o));
            if (odos.length > 0) highestOdo = Math.max(...odos);
        }

        let nextDateStr = '—';
        if (latestDate && intervalDays) {
            const d = new Date(latestDate);
            d.setDate(d.getDate() + intervalDays);
            nextDateStr = d.toISOString().split('T')[0];
        }

        let nextOdoVal = null;
        let nextOdoStr = '—';
        if (highestOdo !== null && intervalOdo !== null) {
            nextOdoVal = highestOdo + intervalOdo;
            nextOdoStr = nextOdoVal.toLocaleString();
        }

        const todayStr = getPhilippineToday();
        const todayObj = new Date(todayStr);

        let dateTag = null;
        if (nextDateStr !== '—') {
            const targetDateObj = new Date(nextDateStr);
            const diffTime = targetDateObj - todayObj;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) dateTag = 'past_due';
            else if (diffDays <= 15) dateTag = 'upcoming';
        }

        let odoTag = null;
        const currentOdoNum = vehicle.current_odo !== null && vehicle.current_odo !== undefined && vehicle.current_odo !== ''
            ? Number(vehicle.current_odo)
            : null;

        if (nextOdoVal !== null && currentOdoNum !== null) {
            if (nextOdoVal <= currentOdoNum) odoTag = 'past_due';
            else if (nextOdoVal - currentOdoNum <= 1000) odoTag = 'upcoming';
        }

        return {
            name,
            nextDate: formatDateToReadable(nextDateStr),
            nextDateRaw: nextDateStr,
            dateTag,
            nextOdo: nextOdoStr,
            nextOdoVal,
            odoTag,
            overallTag: getOverallScheduleTag(dateTag, odoTag),
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

    const formattedOdo = vehicle.current_odo
        ? `${Number(vehicle.current_odo).toLocaleString()} km`
        : '—';

    const formattedUpdatedDate = vehicle.odo_updated_at
        ? formatTimestampToReadable(vehicle.odo_updated_at)
        : null;

    const serviceOptions = servicePreferences.map((srv) => srv.name);

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
                @keyframes fieldShake {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-5px); }
                    40% { transform: translateX(5px); }
                    60% { transform: translateX(-4px); }
                    80% { transform: translateX(4px); }
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
                .shake-invalid {
                    animation: fieldShake 0.36s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
                }
                .interactive-card {
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .interactive-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(28, 28, 28, 0.08);
                    border-color: #b5b0a6;
                }
                .hover-table-row {
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .hover-table-row:hover {
                    background-color: rgba(237, 230, 216, 0.6) !important;
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
                .floating-btn-anim {
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .floating-btn-anim:hover {
                    transform: scale(1.08) translateY(-2px);
                    box-shadow: 0 12px 30px rgba(28, 28, 28, 0.4);
                }
                .floating-btn-anim:active {
                    transform: scale(0.95);
                }
                input[type="date"]::-webkit-calendar-picker-indicator {
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
                .mobile-showcase-meta,
                .mobile-card-list,
                .ref-mobile-select {
                    display: none;
                }
                @media (max-width: 768px) {
                    .page-layout {
                        flex-direction: column !important;
                    }
                    .mainContent {
                        padding: 16px 16px 96px 16px !important;
                    }
                    .tableContainer {
                        display: none !important;
                    }
                    .desktop-only-select,
                    .desktop-only-services {
                        display: none !important;
                    }
                    .ref-mobile-select {
                        position: relative;
                        display: block;
                        width: 100%;
                    }
                    .ref-mobile-select-trigger {
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
                    .ref-mobile-select-trigger.is-focused {
                        border-color: #1c1c1c;
                        box-shadow: 0 0 0 3px rgba(28, 28, 28, 0.12);
                    }
                    .ref-mobile-select-value {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                    .ref-mobile-popover {
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
                    .ref-mobile-popover::-webkit-scrollbar {
                        width: 5px;
                    }
                    .ref-mobile-popover::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .ref-mobile-popover::-webkit-scrollbar-thumb {
                        background-color: #d6ccbb;
                        border-radius: 999px;
                    }
                    .ref-mobile-option {
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
                    .ref-mobile-option:hover {
                        background-color: #ede6d8;
                    }
                    .ref-mobile-option.is-selected {
                        background-color: #ede6d8;
                        color: #1c1c1c;
                        font-weight: 600;
                    }
                    .ref-mobile-option-label {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        flex: 1;
                    }
                    .ref-mobile-check {
                        color: #1c1c1c;
                        flex-shrink: 0;
                    }
                    .ref-mobile-empty {
                        padding: 12px;
                        text-align: center;
                        font-size: 12px;
                        color: #6e6962;
                        font-style: italic;
                    }
                    /* Multi-select Filter Dropdown on Mobile */
                    .mobile-filter-toggle {
                        background-color: #ffffff !important;
                        border-radius: 10px !important;
                        padding: 9px 12px !important;
                        min-width: 156px !important;
                        box-shadow: 0 0 0 3px transparent;
                        transition: border-color 0.18s ease, box-shadow 0.18s ease;
                    }
                    .mobile-filter-toggle.is-open {
                        border-color: #1c1c1c !important;
                        box-shadow: 0 0 0 3px rgba(28, 28, 28, 0.12) !important;
                    }
                    .mobile-filter-menu {
                        width: 240px !important;
                        border-radius: 12px !important;
                        padding: 6px 4px 6px 6px !important;
                        box-shadow: 0 12px 28px rgba(28, 28, 28, 0.14) !important;
                    }
                    .mobile-filter-list {
                        max-height: 210px !important;
                        overflow-y: auto !important;
                        padding: 2px !important;
                        gap: 4px !important;
                    }
                    .mobile-filter-list::-webkit-scrollbar {
                        width: 5px;
                    }
                    .mobile-filter-list::-webkit-scrollbar-thumb {
                        background-color: #d6ccbb;
                        border-radius: 999px;
                    }
                    .mobile-filter-option {
                        width: 100%;
                        background: transparent;
                        border: none;
                        border-radius: 8px !important;
                        padding: 9px 10px !important;
                        color: #1c1c1c;
                        font-size: 13px !important;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 10px;
                        cursor: pointer;
                        text-align: left;
                        box-sizing: border-box;
                        transition: background-color 0.15s ease;
                    }
                    .mobile-filter-option:hover {
                        background-color: #ede6d8 !important;
                        transform: none !important;
                    }
                    .mobile-filter-option.is-selected {
                        background-color: #ede6d8 !important;
                        font-weight: 600;
                    }
                    .mobile-card-list {
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                        width: 100%;
                    }
                    .mobile-record-card {
                        background-color: #ffffff;
                        border: 1px solid #d6ccbb;
                        border-radius: 12px;
                        padding: 14px 16px;
                        box-shadow: 0 4px 12px rgba(28, 28, 28, 0.04);
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                        box-sizing: border-box;
                    }
                    .mobile-record-top-meta {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 8px;
                        font-size: 11px;
                        font-weight: 600;
                        color: #6e6962;
                    }
                    .mobile-record-header {
                        display: flex;
                        align-items: flex-start;
                        justify-content: space-between;
                        gap: 10px;
                    }
                    .mobile-record-title-group {
                        display: flex;
                        flex-direction: column;
                        gap: 3px;
                        min-width: 0;
                        flex: 1;
                    }
                    .mobile-record-title {
                        font-size: 14px;
                        font-weight: 700;
                        color: #1c1c1c;
                        margin: 0;
                        line-height: 1.3;
                    }
                    .mobile-record-subtitle {
                        font-size: 12px;
                        color: #6e6962;
                        margin: 0;
                        line-height: 1.35;
                    }
                    .mobile-record-rows {
                        display: flex;
                        flex-direction: column;
                        gap: 6px;
                        padding-top: 8px;
                        border-top: 1px solid #ede6d8;
                    }
                    .mobile-record-row {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 12px;
                        font-size: 12px;
                    }
                    .mobile-record-label {
                        color: #6e6962;
                        font-weight: 500;
                        flex-shrink: 0;
                    }
                    .mobile-record-val {
                        color: #1c1c1c;
                        font-weight: 500;
                        text-align: right;
                        overflow-wrap: anywhere;
                    }
                    .mobile-edit-grid {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                    }
                    .mobile-edit-field {
                        display: flex;
                        flex-direction: column;
                        gap: 4px;
                    }
                    .mobile-edit-label {
                        font-size: 10px;
                        font-weight: 600;
                        text-transform: uppercase;
                        color: #6e6962;
                        letter-spacing: 0.4px;
                    }
                    .mobile-edit-actions {
                        display: flex;
                        justify-content: flex-end;
                        gap: 8px;
                        padding-top: 4px;
                    }
                    .mobile-empty-card {
                        background-color: #ffffff;
                        border: 1px solid #d6ccbb;
                        border-radius: 12px;
                        padding: 22px 16px;
                        text-align: center;
                        color: #6e6962;
                        font-size: 12px;
                        font-style: italic;
                    }
                    .profileCard {
                        flex-direction: column !important;
                        align-items: stretch !important;
                        gap: 14px !important;
                        padding: 16px !important;
                    }
                    .mobile-card-top-bar {
                        display: flex;
                        justify-content: flex-end;
                        margin-bottom: -4px;
                    }
                    .updateOdoBtnTopRight {
                        position: static !important;
                    }
                    .profileLeft {
                        width: 100%;
                    }
                    .photoThumbContainer,
                    .placeholderThumb {
                        width: 100% !important;
                        height: 210px !important;
                        border-radius: 12px !important;
                    }
                    .profileRight {
                        display: none !important;
                    }
                    .mobile-showcase-meta {
                        display: flex;
                        flex-direction: column;
                        gap: 6px;
                    }
                    .mobile-title-row {
                        display: flex;
                        align-items: flex-start;
                        justify-content: space-between;
                        gap: 12px;
                    }
                    .mobile-vehicle-title {
                        font-size: 16px;
                        font-weight: 700;
                        color: #1c1c1c;
                        margin: 0;
                        line-height: 1.25;
                    }
                    .mobile-sub-line {
                        font-size: 13px;
                        color: #6e6962;
                        line-height: 1.35;
                        margin: 0;
                    }
                    .mobile-odo-line {
                        font-size: 13px;
                        font-weight: 600;
                        color: #1c1c1c;
                        text-decoration: underline;
                        text-underline-offset: 3px;
                        margin-top: 2px;
                        display: inline-block;
                    }
                    .mobile-desc-line {
                        font-size: 12px;
                        color: #6e6962;
                        line-height: 1.45;
                        margin: 2px 0 0 0;
                    }
                    .floating-btn-anim {
                        bottom: 84px !important;
                        right: 20px !important;
                    }
                }
            `}</style>

            <Sidebar activePage="home" />

            <div style={styles.mainContent} className="mainContent">
                <Toast message={toastMessage} duration={1000} onClose={() => setToastMessage(null)} />

                <div style={styles.topBar}>
                    <Breadcrumb items={[
                        { label: 'Main / Home', href: '/home' },
                        { label: `${vehicle.make} ${vehicle.model}` }
                    ]} />
                    <Link href="/home" style={styles.backIconButton} className="hover-btn" title="Back to Rides">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </Link>
                </div>

                <div style={styles.contentBody}>
                    <div style={styles.profileCard} className="interactive-card page-card-anim profileCard">
                        <div className="mobile-card-top-bar">
                            <button onClick={openOdoModal} style={styles.updateOdoBtnTopRight} className="hover-btn updateOdoBtnTopRight" type="button" title="Update Current ODO">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                Update ODO
                            </button>
                        </div>

                        <div style={styles.profileLeft} className="profileLeft">
                            {photoUrl ? (
                                <div style={styles.photoThumbContainer} className="photoThumbContainer" onClick={() => setShowPhotoModal(true)} title="Click to view full size">
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
                                <div style={styles.placeholderThumb} className="placeholderThumb" onClick={() => setShowPhotoModal(true)}>
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1c1c1c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2.5-4.5c-.3-.5-.9-.8-1.5-.8H10c-.6 0-1.2.3-1.5.8L6 10l-2.5 1.1C2.7 12.3 2 13.1 2 14v3c0 .6.4 1 1 1h2"></path>
                                        <circle cx="7" cy="17" r="2"></circle>
                                        <circle cx="17" cy="17" r="2"></circle>
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Mobile Reference-Style Metadata Layout */}
                        <div className="mobile-showcase-meta">
                            <div className="mobile-title-row">
                                <h1 className="mobile-vehicle-title">{vehicle.make} {vehicle.model}</h1>
                                <span style={styles.typeBadge}>{vehicle.type}</span>
                            </div>
                            <p className="mobile-sub-line">Year {vehicle.year}</p>
                            <p className="mobile-sub-line">
                                {formattedUpdatedDate ? `ODO updated ${formattedUpdatedDate}` : 'Odometer status'}
                            </p>
                            <div>
                                <span className="mobile-odo-line">{formattedOdo}</span>
                            </div>
                            {vehicle.description && (
                                <p className="mobile-desc-line">{vehicle.description}</p>
                            )}
                        </div>

                        {/* Desktop Horizontal Details Layout */}
                        <div style={styles.profileRight} className="profileRight">
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
                                <span style={styles.detailKey}>Current ODO:</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <span style={styles.detailVal}>{formattedOdo}</span>
                                    {formattedUpdatedDate && (
                                        <span style={styles.lastUpdatedText}>
                                            (Updated: {formattedUpdatedDate})
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div style={styles.detailItem}>
                                <span style={styles.detailKey}>Description:</span>
                                <span style={styles.detailVal}>{vehicle.description || '—'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Service Schedule Status */}
                    <div style={styles.sectionHeaderRow}>
                        <h2 style={styles.sectionTitle}>Service Schedule Status</h2>
                    </div>

                    <div style={styles.tableContainer} className="page-card-anim tableContainer">
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
                                        <td colSpan="3" style={styles.emptyTableCell}>No services configured in settings.</td>
                                    </tr>
                                ) : (
                                    serviceScheduleStatus.map((item, idx) => (
                                        <tr key={idx} style={styles.tableBodyRow} className="hover-table-row">
                                            <td style={styles.td}><span style={styles.serviceBadge}>{item.name}</span></td>
                                            <td style={styles.td}>
                                                <div style={styles.cellWithTag}>
                                                    <span>{item.nextDate}</span>
                                                    {item.dateTag === 'past_due' && <span style={styles.tagPastDue}>Past Due</span>}
                                                    {item.dateTag === 'upcoming' && <span style={styles.tagUpcoming}>Upcoming</span>}
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={styles.cellWithTag}>
                                                    <span>{item.nextOdo}</span>
                                                    {item.odoTag === 'past_due' && <span style={styles.tagPastDue}>Past Due</span>}
                                                    {item.odoTag === 'upcoming' && <span style={styles.tagUpcoming}>Upcoming</span>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View: Service Schedule Status */}
                    <div className="mobile-card-list page-card-anim">
                        {serviceScheduleStatus.length === 0 ? (
                            <div className="mobile-empty-card">No services configured in settings.</div>
                        ) : (
                            serviceScheduleStatus.map((item, idx) => (
                                <div key={idx} className="mobile-record-card">
                                    <div className="mobile-record-header">
                                        <div className="mobile-record-title-group">
                                            <h3 className="mobile-record-title">{item.name}</h3>
                                            <p className="mobile-record-subtitle">Service schedule interval</p>
                                        </div>
                                        {item.overallTag === 'past_due' && <span style={styles.tagPastDue}>Past Due</span>}
                                        {item.overallTag === 'upcoming' && <span style={styles.tagUpcoming}>Upcoming</span>}
                                    </div>
                                    <div className="mobile-record-rows">
                                        <div className="mobile-record-row">
                                            <span className="mobile-record-label">Next Schedule (Date)</span>
                                            <span className="mobile-record-val">
                                                {item.nextDate}
                                                {item.dateTag === 'past_due' && ' · Past Due'}
                                                {item.dateTag === 'upcoming' && ' · Upcoming'}
                                            </span>
                                        </div>
                                        <div className="mobile-record-row">
                                            <span className="mobile-record-label">Next Schedule (ODO)</span>
                                            <span className="mobile-record-val">
                                                {item.nextOdo}
                                                {item.odoTag === 'past_due' && ' · Past Due'}
                                                {item.odoTag === 'upcoming' && ' · Upcoming'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Maintenance Logs */}
                    <div style={styles.sectionHeaderRow}>
                        <h2 style={styles.sectionTitle}>Maintenance Logs</h2>

                        <div style={styles.dropdownWrapper} ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                style={styles.dropdownToggleBtn}
                                className={`hover-btn mobile-filter-toggle ${showFilterDropdown ? 'is-open' : ''}`}
                            >
                                <span>
                                    {selectedServiceFilters.length === 0 ? 'Filter Services' : `Services (${selectedServiceFilters.length})`}
                                </span>
                                <div style={styles.dropdownToggleRight}>
                                    {selectedServiceFilters.length > 0 && (
                                        <span onClick={clearFilters} style={styles.clearIconBadge} title="Clear filters">✕</span>
                                    )}
                                    <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{
                                            transform: showFilterDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.2s ease',
                                        }}
                                    >
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                            </button>

                            {showFilterDropdown && (
                                <div style={styles.dropdownMenu} className="mobile-filter-menu">
                                    <div style={styles.dropdownHeader}>
                                        <span style={styles.dropdownTitle}>Filter by Service</span>
                                        {selectedServiceFilters.length > 0 && (
                                            <button type="button" onClick={clearFilters} style={styles.dropdownClearText}>Clear All</button>
                                        )}
                                    </div>
                                    <div style={styles.dropdownList} className="mobile-filter-list">
                                        {loggedServicesList.length === 0 ? (
                                            <span style={styles.dropdownEmpty}>No logged services available.</span>
                                        ) : (
                                            loggedServicesList.map((serviceName, idx) => {
                                                const isChecked = selectedServiceFilters.includes(serviceName);
                                                return (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => handleFilterCheckboxToggle(serviceName)}
                                                        className={`mobile-filter-option ${isChecked ? 'is-selected' : ''}`}
                                                    >
                                                        <span className="ref-mobile-option-label">{serviceName}</span>
                                                        {isChecked && (
                                                            <svg
                                                                className="ref-mobile-check"
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
                                            })
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={styles.tableContainer} className="page-card-anim tableContainer">
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
                                        <td colSpan="6" style={styles.emptyTableCell}>No maintenance records found.</td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => {
                                        const isEditing = editingLogId === log.id;
                                        return (
                                            <tr key={log.id} style={styles.tableBodyRow} className="hover-table-row">
                                                <td style={styles.td}>
                                                    {isEditing ? (
                                                        <input
                                                            key={inlineEmptyFields.date ? `tbl-date-${log.id}-${shakeKey}` : `tbl-date-${log.id}`}
                                                            type="date"
                                                            value={inlineData.date}
                                                            onChange={e => {
                                                                setInlineData({ ...inlineData, date: e.target.value });
                                                                if (e.target.value.trim()) clearInlineEmptyError('date');
                                                            }}
                                                            className={inlineEmptyFields.date ? 'shake-invalid' : ''}
                                                            style={{
                                                                ...styles.inlineInput,
                                                                borderColor: inlineEmptyFields.date ? '#b3251e' : '#d6ccbb',
                                                            }}
                                                        />
                                                    ) : (
                                                        formatDateToReadable(log.date)
                                                    )}
                                                </td>
                                                <td style={styles.td}>
                                                    {isEditing ? (
                                                        <select
                                                            key={inlineEmptyFields.services ? `tbl-svc-${log.id}-${shakeKey}` : `tbl-svc-${log.id}`}
                                                            value={inlineData.services}
                                                            onChange={e => {
                                                                setInlineData({ ...inlineData, services: e.target.value });
                                                                if (e.target.value.trim()) clearInlineEmptyError('services');
                                                            }}
                                                            className={inlineEmptyFields.services ? 'shake-invalid' : ''}
                                                            style={{
                                                                ...styles.inlineSelect,
                                                                borderColor: inlineEmptyFields.services ? '#b3251e' : '#d6ccbb',
                                                            }}
                                                        >
                                                            {servicePreferences.map((srv, i) => (
                                                                <option key={i} value={srv.name}>{srv.name}</option>
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
                                                <td style={styles.td}>
                                                    {isEditing ? (
                                                        <input
                                                            key={inlineEmptyFields.odo ? `tbl-odo-${log.id}-${shakeKey}` : `tbl-odo-${log.id}`}
                                                            type="text"
                                                            value={inlineData.odo}
                                                            onChange={e => {
                                                                const val = e.target.value;
                                                                if (/^\d*$/.test(val)) {
                                                                    setInlineData({ ...inlineData, odo: val });
                                                                    if (val.trim()) clearInlineEmptyError('odo');
                                                                }
                                                            }}
                                                            className={inlineEmptyFields.odo ? 'shake-invalid' : ''}
                                                            style={{
                                                                ...styles.inlineInput,
                                                                borderColor: inlineEmptyFields.odo ? '#b3251e' : '#d6ccbb',
                                                            }}
                                                        />
                                                    ) : (
                                                        log.odo
                                                    )}
                                                </td>
                                                <td style={styles.td}>
                                                    {isEditing ? (
                                                        <input type="text" value={inlineData.cost} onChange={e => {
                                                            const val = e.target.value;
                                                            if (/^\d*\.?\d*$/.test(val)) setInlineData({ ...inlineData, cost: val });
                                                        }} style={styles.inlineInput} />
                                                    ) : (
                                                        log.cost ? `₱${Number(log.cost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'
                                                    )}
                                                </td>
                                                <td style={styles.td}>
                                                    {isEditing ? (
                                                        <input type="text" value={inlineData.notes} onChange={e => setInlineData({ ...inlineData, notes: e.target.value })} style={styles.inlineInput} />
                                                    ) : (
                                                        log.notes || '—'
                                                    )}
                                                </td>
                                                <td style={{ ...styles.td, textAlign: 'right' }}>
                                                    <div style={styles.rowActions}>
                                                        {isEditing ? (
                                                            <>
                                                                <button onClick={() => saveEditingRow(log.id)} style={styles.iconBtnSave} className="hover-btn" title="Save changes" type="button">
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                                </button>
                                                                <button onClick={cancelEditingRow} style={styles.iconBtnCancel} className="hover-btn" title="Cancel" type="button">
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button onClick={() => startEditingRow(log)} style={styles.iconBtnEdit} className="hover-btn" title="Edit record" type="button">
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                                </button>
                                                                <button onClick={() => promptDeleteLog(log)} style={styles.iconBtnDelete} className="hover-btn" title="Delete record" type="button">
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
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

                    {/* Mobile Card View: Maintenance Logs */}
                    <div className="mobile-card-list page-card-anim">
                        {filteredLogs.length === 0 ? (
                            <div className="mobile-empty-card">No maintenance records found.</div>
                        ) : (
                            filteredLogs.map((log) => {
                                const isEditing = editingLogId === log.id;
                                const serviceTitle = (log.services && log.services.length > 0)
                                    ? log.services.join(', ')
                                    : 'Maintenance Service';
                                const formattedCost = log.cost
                                    ? `₱${Number(log.cost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                    : '—';

                                return (
                                    <div key={log.id} className="mobile-record-card">
                                        {isEditing ? (
                                            <div className="mobile-edit-grid">
                                                <div className="mobile-edit-field">
                                                    <span className="mobile-edit-label">Date</span>
                                                    <input
                                                        key={inlineEmptyFields.date ? `mob-date-${log.id}-${shakeKey}` : `mob-date-${log.id}`}
                                                        type="date"
                                                        value={inlineData.date}
                                                        onChange={e => {
                                                            setInlineData({ ...inlineData, date: e.target.value });
                                                            if (e.target.value.trim()) clearInlineEmptyError('date');
                                                        }}
                                                        className={inlineEmptyFields.date ? 'shake-invalid' : ''}
                                                        style={{
                                                            ...styles.inlineInput,
                                                            borderColor: inlineEmptyFields.date ? '#b3251e' : '#d6ccbb',
                                                        }}
                                                    />
                                                </div>
                                                <div className="mobile-edit-field">
                                                    <span className="mobile-edit-label">Service</span>
                                                    <div className="desktop-only-select">
                                                        <select
                                                            value={inlineData.services}
                                                            onChange={e => {
                                                                setInlineData({ ...inlineData, services: e.target.value });
                                                                if (e.target.value.trim()) clearInlineEmptyError('services');
                                                            }}
                                                            style={{
                                                                ...styles.inlineSelect,
                                                                borderColor: inlineEmptyFields.services ? '#b3251e' : '#d6ccbb',
                                                            }}
                                                        >
                                                            {servicePreferences.map((srv, i) => (
                                                                <option key={i} value={srv.name}>{srv.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <MobileSelectDropdown
                                                        value={inlineData.services}
                                                        options={serviceOptions}
                                                        placeholder="Select service"
                                                        isInvalid={Boolean(inlineEmptyFields.services)}
                                                        shakeKey={shakeKey}
                                                        onChange={(val) => {
                                                            setInlineData({ ...inlineData, services: val });
                                                            if (String(val || '').trim()) clearInlineEmptyError('services');
                                                        }}
                                                    />
                                                </div>
                                                <div className="mobile-edit-field">
                                                    <span className="mobile-edit-label">ODO</span>
                                                    <input
                                                        key={inlineEmptyFields.odo ? `mob-odo-${log.id}-${shakeKey}` : `mob-odo-${log.id}`}
                                                        type="text"
                                                        value={inlineData.odo}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            if (/^\d*$/.test(val)) {
                                                                setInlineData({ ...inlineData, odo: val });
                                                                if (val.trim()) clearInlineEmptyError('odo');
                                                            }
                                                        }}
                                                        className={inlineEmptyFields.odo ? 'shake-invalid' : ''}
                                                        style={{
                                                            ...styles.inlineInput,
                                                            borderColor: inlineEmptyFields.odo ? '#b3251e' : '#d6ccbb',
                                                        }}
                                                    />
                                                </div>
                                                <div className="mobile-edit-field">
                                                    <span className="mobile-edit-label">Cost</span>
                                                    <input
                                                        type="text"
                                                        value={inlineData.cost}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            if (/^\d*\.?\d*$/.test(val)) setInlineData({ ...inlineData, cost: val });
                                                        }}
                                                        style={styles.inlineInput}
                                                    />
                                                </div>
                                                <div className="mobile-edit-field">
                                                    <span className="mobile-edit-label">Notes</span>
                                                    <input
                                                        type="text"
                                                        value={inlineData.notes}
                                                        onChange={e => setInlineData({ ...inlineData, notes: e.target.value })}
                                                        style={styles.inlineInput}
                                                    />
                                                </div>
                                                <div className="mobile-edit-actions">
                                                    <button onClick={cancelEditingRow} style={styles.iconBtnCancel} className="hover-btn" title="Cancel" type="button">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                    </button>
                                                    <button onClick={() => saveEditingRow(log.id)} style={styles.iconBtnSave} className="hover-btn" title="Save changes" type="button">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="mobile-record-top-meta">
                                                    <span>{formatDateToReadable(log.date)}</span>
                                                    <span style={{ color: '#1c1c1c', fontWeight: '700' }}>{formattedCost}</span>
                                                </div>
                                                <div className="mobile-record-header">
                                                    <div className="mobile-record-title-group">
                                                        <h3 className="mobile-record-title">{serviceTitle}</h3>
                                                        <p className="mobile-record-subtitle">ODO: {log.odo}</p>
                                                    </div>
                                                    <div style={styles.rowActions}>
                                                        <button onClick={() => startEditingRow(log)} style={styles.iconBtnEdit} className="hover-btn" title="Edit record" type="button">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                        </button>
                                                        <button onClick={() => promptDeleteLog(log)} style={styles.iconBtnDelete} className="hover-btn" title="Delete record" type="button">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="mobile-record-rows">
                                                    <div className="mobile-record-row">
                                                        <span className="mobile-record-label">Notes</span>
                                                        <span className="mobile-record-val">{log.notes || '—'}</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <button onClick={openCreateModal} style={styles.floatingBtn} className="floating-btn-anim" title="Add Maintenance Log" type="button">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>

                {showPhotoModal && photoUrl && (
                    <div style={styles.modalOverlay} className="animated-overlay" onClick={() => setShowPhotoModal(false)}>
                        <div style={styles.fullPhotoBox} className="animated-modal" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setShowPhotoModal(false)} style={styles.closePhotoBtn} type="button">✕</button>
                            <img src={photoUrl} alt={vehicle.make} style={styles.fullImage} />
                        </div>
                    </div>
                )}

                {showOdoModal && (
                    <div style={styles.modalOverlay} className="animated-overlay">
                        <div style={styles.modalBox} className="animated-modal">
                            <div style={styles.modalHeader}>
                                <h3 style={styles.modalTitle}>Update Current ODO</h3>
                                <button onClick={closeOdoModal} style={styles.closeBtn} type="button">✕</button>
                            </div>
                            <form onSubmit={handleUpdateOdo} style={styles.form} noValidate>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Current Odometer (km/miles) *</label>
                                    <input
                                        key={odoEmptyError ? `odo-${shakeKey}` : 'odo'}
                                        type="text"
                                        placeholder="e.g. 15500"
                                        value={odoData.current_odo}
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (/^\d*$/.test(val)) {
                                                setOdoData('current_odo', val);
                                                if (val.trim()) setOdoEmptyError(false);
                                            }
                                        }}
                                        className={odoEmptyError ? 'shake-invalid' : ''}
                                        style={{
                                            ...styles.input,
                                            borderColor: odoEmptyError ? '#b3251e' : '#d6ccbb',
                                        }}
                                        autoFocus
                                    />
                                    {odoErrors.current_odo && <span style={styles.errorText}>{odoErrors.current_odo}</span>}
                                </div>
                                <div style={styles.modalActions}>
                                    <button type="button" onClick={closeOdoModal} style={styles.cancelBtn} className="hover-btn">Cancel</button>
                                    <button type="submit" style={styles.saveBtn} className="hover-btn" disabled={odoProcessing}>{odoProcessing ? 'Saving...' : 'Save ODO'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showLogModal && (
                    <div style={styles.modalOverlay} className="animated-overlay">
                        <div style={styles.modalBox} className="animated-modal">
                            <div style={styles.modalHeader}>
                                <h3 style={styles.modalTitle}>Add Maintenance Log</h3>
                                <button onClick={closeModal} style={styles.closeBtn} type="button">✕</button>
                            </div>
                            <form onSubmit={handleSubmitLog} style={styles.form} noValidate>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Services Done * (Select one or more)</label>
                                    <div
                                        key={logEmptyFields.services ? `log-svc-${shakeKey}` : 'log-svc'}
                                        style={{
                                            ...styles.checkboxContainer,
                                            borderColor: logEmptyFields.services ? '#b3251e' : '#d6ccbb',
                                        }}
                                        className={`desktop-only-services ${logEmptyFields.services ? 'shake-invalid' : ''}`}
                                    >
                                        {servicePreferences.length === 0 ? (
                                            <span style={styles.noServiceText}>No services configured in settings.</span>
                                        ) : (
                                            servicePreferences.map((service, idx) => (
                                                <label key={idx} style={styles.checkboxLabel} className="hover-list-item">
                                                    <input type="checkbox" checked={data.services.includes(service.name)} onChange={() => handleServiceToggle(service.name)} style={styles.checkboxInput} />
                                                    {service.name}
                                                </label>
                                            ))
                                        )}
                                    </div>
                                    <MobileSelectDropdown
                                        value={data.services}
                                        options={serviceOptions}
                                        placeholder="Select services"
                                        multiple={true}
                                        isInvalid={Boolean(logEmptyFields.services)}
                                        shakeKey={shakeKey}
                                        onChange={(updatedServices) => {
                                            setData('services', updatedServices);
                                            if (updatedServices.length > 0) clearLogEmptyError('services');
                                        }}
                                    />
                                    {errors.services && <span style={styles.errorText}>{errors.services}</span>}
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Odometer (ODO) (miles/km) *</label>
                                    <input
                                        key={logEmptyFields.odo ? `log-odo-${shakeKey}` : 'log-odo'}
                                        type="text"
                                        placeholder="e.g. 45000"
                                        value={data.odo}
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (/^\d*$/.test(val)) {
                                                setData('odo', val);
                                                if (val.trim()) clearLogEmptyError('odo');
                                            }
                                        }}
                                        className={logEmptyFields.odo ? 'shake-invalid' : ''}
                                        style={{
                                            ...styles.input,
                                            borderColor: logEmptyFields.odo ? '#b3251e' : '#d6ccbb',
                                        }}
                                    />
                                    {errors.odo && <span style={styles.errorText}>{errors.odo}</span>}
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Date *</label>
                                    <input
                                        key={logEmptyFields.date ? `log-date-${shakeKey}` : 'log-date'}
                                        type="date"
                                        value={data.date}
                                        onChange={e => {
                                            setData('date', e.target.value);
                                            if (e.target.value.trim()) clearLogEmptyError('date');
                                        }}
                                        className={logEmptyFields.date ? 'shake-invalid' : ''}
                                        style={{
                                            ...styles.input,
                                            borderColor: logEmptyFields.date ? '#b3251e' : '#d6ccbb',
                                        }}
                                    />
                                    {errors.date && <span style={styles.errorText}>{errors.date}</span>}
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Cost (PHP)</label>
                                    <div style={styles.currencyWrapper}>
                                        <span style={styles.currencySymbol}>₱</span>
                                        <input
                                            type="text" placeholder="0.00" value={data.cost}
                                            onChange={e => {
                                                const val = e.target.value;
                                                if (/^\d*\.?\d*$/.test(val)) setData('cost', val);
                                            }}
                                            style={{ ...styles.input, paddingLeft: '26px' }}
                                        />
                                    </div>
                                    {errors.cost && <span style={styles.errorText}>{errors.cost}</span>}
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Notes (Optional)</label>
                                    <textarea placeholder="Mechanic notes, workshop details..." value={data.notes} onChange={e => setData('notes', e.target.value)} style={{ ...styles.input, height: '60px', resize: 'none' }} />
                                    {errors.notes && <span style={styles.errorText}>{errors.notes}</span>}
                                </div>

                                <div style={styles.modalActions}>
                                    <button type="button" onClick={closeModal} style={styles.cancelBtn} className="hover-btn">Cancel</button>
                                    <button type="submit" style={styles.saveBtn} className="hover-btn" disabled={processing}>{processing ? 'Saving...' : 'Save Log'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showDeleteLogModal && (
                    <div style={styles.modalOverlay} className="animated-overlay">
                        <div style={styles.modalBox} className="animated-modal">
                            <div style={styles.modalHeader}>
                                <h3 style={styles.modalTitle}>Delete Maintenance Log</h3>
                                <button onClick={() => setShowDeleteLogModal(false)} style={styles.closeBtn} type="button">✕</button>
                            </div>
                            <p style={{ color: '#6e6962', fontSize: '13px', margin: '8px 0 16px 0' }}>Are you sure you want to delete this maintenance record? This action cannot be undone.</p>
                            <div style={styles.modalActions}>
                                <button type="button" onClick={() => setShowDeleteLogModal(false)} style={styles.cancelBtn} className="hover-btn">Cancel</button>
                                <button type="button" onClick={confirmDeleteLog} style={styles.deleteCardBtn} className="hover-btn">Delete</button>
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
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', width: '100%', maxWidth: '850px' },
    backIconButton: {
        backgroundColor: '#ede6d8', color: '#1c1c1c', border: '1px solid #d6ccbb',
        width: '32px', height: '32px', borderRadius: '6px', display: 'flex',
        justifyContent: 'center', alignItems: 'center', textDecoration: 'none',
    },
    contentBody: { display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '850px', width: '100%', paddingBottom: '60px', margin: '0 auto' },

    profileCard: {
        backgroundColor: '#ffffff', border: '1px solid #d6ccbb', borderRadius: '12px',
        padding: '20px', boxShadow: '0 4px 12px rgba(28, 28, 28, 0.04)', display: 'flex', alignItems: 'center', gap: '24px',
        position: 'relative', width: '100%', boxSizing: 'border-box'
    },
    profileLeft: { flexShrink: 0 },
    photoThumbContainer: {
        width: '120px', height: '90px', borderRadius: '8px', overflow: 'hidden',
        backgroundColor: '#ede6d8', border: '1px solid #d6ccbb', position: 'relative', cursor: 'pointer',
        display: 'flex', justifyContent: 'center', alignItems: 'center'
    },
    vehicleThumb: { width: '100%', height: '100%', objectFit: 'cover' },
    photoOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(28, 28, 28, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center',
        opacity: 0, transition: 'opacity 0.2s ease',
    },
    placeholderThumb: { width: '120px', height: '90px', borderRadius: '8px', backgroundColor: '#ede6d8', border: '1px solid #d6ccbb', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    profileRight: { flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' },
    detailItem: { display: 'flex', alignItems: 'center', fontSize: '13px', gap: '8px', flexWrap: 'wrap' },
    detailKey: { color: '#6e6962', fontWeight: '500', width: '105px', flexShrink: 0 },
    detailVal: { color: '#1c1c1c', fontWeight: '500' },
    typeBadge: { display: 'inline-block', backgroundColor: '#1c1c1c10', color: '#1c1c1c', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 },
    updateOdoBtnTopRight: {
        position: 'absolute', top: '16px', right: '16px',
        backgroundColor: '#ede6d8', color: '#1c1c1c', border: '1px solid #d6ccbb',
        padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '500', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '6px',
    },
    lastUpdatedText: { color: '#6e6962', fontSize: '11px', fontStyle: 'italic' },

    cellWithTag: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
    tagUpcoming: { backgroundColor: '#eab30824', color: '#854d0e', border: '1px solid #eab30866', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.4px', flexShrink: 0 },
    tagPastDue: { backgroundColor: '#dc262618', color: '#dc2626', border: '1px solid #dc262644', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.4px', flexShrink: 0 },

    fullPhotoBox: { backgroundColor: '#ffffff', border: '1px solid #d6ccbb', borderRadius: '12px', padding: '16px', maxWidth: '85vw', maxHeight: '85vh', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 25px 50px rgba(28, 28, 28, 0.3)' },
    fullImage: { maxWidth: '100%', maxHeight: '75vh', borderRadius: '8px', objectFit: 'contain' },
    closePhotoBtn: { position: 'absolute', top: '12px', right: '12px', background: 'rgba(28, 28, 28, 0.7)', border: '1px solid #d6ccbb', color: '#ffffff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', zIndex: 10 },

    sectionHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', width: '100%', flexWrap: 'wrap', gap: '8px' },
    sectionTitle: { fontSize: '18px', fontWeight: '600', color: '#1c1c1c', margin: 0 },
    dropdownWrapper: { position: 'relative' },
    dropdownToggleBtn: {
        backgroundColor: '#ffffff', border: '1px solid #d6ccbb', borderRadius: '6px',
        padding: '7px 14px', color: '#1c1c1c', fontSize: '12px', fontWeight: '500',
        display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', outline: 'none',
        minWidth: '150px', justifyContent: 'space-between'
    },
    dropdownToggleRight: { display: 'flex', alignItems: 'center', gap: '8px' },
    clearIconBadge: { backgroundColor: '#b3251e15', color: '#b3251e', fontSize: '10px', fontWeight: '700', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' },
    dropdownMenu: { position: 'absolute', right: 0, top: 'calc(100% + 6px)', width: '220px', backgroundColor: '#ffffff', border: '1px solid #d6ccbb', borderRadius: '8px', boxShadow: '0 10px 25px rgba(28, 28, 28, 0.15)', zIndex: 50, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    dropdownHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid #ede6d8', backgroundColor: '#ede6d8' },
    dropdownTitle: { fontSize: '11px', fontWeight: '600', color: '#6e6962', textTransform: 'uppercase' },
    dropdownClearText: { background: 'none', border: 'none', color: '#b3251e', fontSize: '11px', cursor: 'pointer', fontWeight: '700' },
    dropdownList: { padding: '6px', display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '180px', overflowY: 'auto' },
    dropdownItemLabel: { display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '4px', color: '#1c1c1c', fontSize: '12px', cursor: 'pointer' },
    dropdownCheckbox: { accentColor: '#b3251e', width: '13px', height: '13px', cursor: 'pointer' },
    dropdownEmpty: { padding: '12px', textAlign: 'center', color: '#6e6962', fontSize: '12px', fontStyle: 'italic' },

    tableContainer: { backgroundColor: '#ffffff', border: '1px solid #d6ccbb', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(28, 28, 28, 0.04)', width: '100%', boxSizing: 'border-box' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' },
    tableHeaderRow: { backgroundColor: '#ede6d8', borderBottom: '1px solid #d6ccbb', color: '#6e6962' },
    th: { padding: '10px 14px', fontWeight: '600', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' },
    tableBodyRow: { borderBottom: '1px solid #ede6d8' },
    td: { padding: '12px 14px', color: '#1c1c1c', verticalAlign: 'middle' },
    emptyTableCell: { padding: '24px', textAlign: 'center', color: '#6e6962', fontStyle: 'italic' },
    serviceBadgeList: { display: 'flex', flexWrap: 'wrap', gap: '4px' },
    serviceBadge: { backgroundColor: '#1c1c1c10', color: '#1c1c1c', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' },

    inlineInput: { backgroundColor: '#ede6d8', border: '1px solid #d6ccbb', borderRadius: '4px', padding: '5px 8px', color: '#1c1c1c', fontSize: '12px', outline: 'none', width: '100%', boxSizing: 'border-box', transition: 'border-color 0.2s ease' },
    inlineSelect: { backgroundColor: '#ede6d8', border: '1px solid #d6ccbb', borderRadius: '4px', padding: '5px 8px', color: '#1c1c1c', fontSize: '12px', outline: 'none', width: '100%', boxSizing: 'border-box', transition: 'border-color 0.2s ease' },

    rowActions: { display: 'flex', justifyContent: 'flex-end', gap: '6px', alignItems: 'center' },
    iconBtnEdit: { backgroundColor: '#ede6d8', color: '#1c1c1c', border: '1px solid #d6ccbb', width: '28px', height: '28px', borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' },
    iconBtnDelete: { backgroundColor: '#b3251e15', color: '#b3251e', border: '1px solid #d6ccbb', width: '28px', height: '28px', borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' },
    iconBtnSave: { backgroundColor: '#1c1c1c15', color: '#1c1c1c', border: '1px solid #d6ccbb', width: '28px', height: '28px', borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' },
    iconBtnCancel: { backgroundColor: '#ede6d8', color: '#1c1c1c', border: '1px solid #d6ccbb', width: '28px', height: '28px', borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' },

    floatingBtn: {
        position: 'fixed', bottom: '32px', right: '32px', width: '56px', height: '56px',
        backgroundColor: '#1c1c1c', color: '#ede6d8', borderRadius: '50%', border: 'none',
        display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer',
        boxShadow: '0 8px 24px rgba(28, 28, 28, 0.3)', zIndex: 100,
    },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(28, 28, 28, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px' },
    modalBox: { backgroundColor: '#ffffff', border: '1px solid #d6ccbb', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 40px rgba(28, 28, 28, 0.2)', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { color: '#1c1c1c', fontSize: '16px', fontWeight: '600', margin: 0 },
    closeBtn: { background: 'none', border: 'none', color: '#6e6962', fontSize: '16px', cursor: 'pointer' },
    form: { display: 'flex', flexDirection: 'column', gap: '12px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { color: '#6e6962', fontSize: '11px', fontWeight: '500' },
    input: { backgroundColor: '#ede6d8', border: '1px solid #d6ccbb', borderRadius: '6px', padding: '8px 10px', color: '#1c1c1c', fontSize: '12px', outline: 'none', boxSizing: 'border-box', width: '100%', transition: 'border-color 0.2s ease' },
    checkboxContainer: { backgroundColor: '#ede6d8', border: '1px solid #d6ccbb', borderRadius: '6px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '140px', overflowY: 'auto', transition: 'border-color 0.2s ease' },
    checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', color: '#1c1c1c', fontSize: '12px', cursor: 'pointer' },
    checkboxInput: { accentColor: '#b3251e', width: '14px', height: '14px', cursor: 'pointer' },
    noServiceText: { color: '#6e6962', fontSize: '12px', fontStyle: 'italic', textAlign: 'center' },
    currencyWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    currencySymbol: { position: 'absolute', left: '10px', color: '#6e6962', fontSize: '12px', fontWeight: '600' },
    errorText: { color: '#b3251e', fontSize: '11px', marginTop: '2px' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #ede6d8', paddingTop: '14px', marginTop: '4px' },
    cancelBtn: { backgroundColor: '#ede6d8', color: '#1c1c1c', border: '1px solid #d6ccbb', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
    saveBtn: { backgroundColor: '#1c1c1c', color: '#ede6d8', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
    deleteCardBtn: { backgroundColor: '#b3251e15', color: '#b3251e', border: '1px solid #d6ccbb', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
};
