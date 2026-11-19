import { useState, useRef, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import Toast from '@/Components/Toast';
import Breadcrumb from '@/Components/Breadcrumb';

function MobileDropdown({
    value,
    options = [],
    placeholder = 'Select option',
    multiple = false,
    onChange,
}) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('touchstart', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('touchstart', handleOutsideClick);
        };
    }, []);

    const selectedValues = multiple
        ? (Array.isArray(value) ? value : [])
        : [];

    const displayLabel = multiple
        ? (selectedValues.length === 0
            ? placeholder
            : selectedValues.length === 1
                ? selectedValues[0]
                : `${selectedValues.length} selected`)
        : (value || placeholder);

    const handleSelectOption = (optValue) => {
        if (multiple) {
            const exists = selectedValues.includes(optValue);
            const next = exists
                ? selectedValues.filter((item) => item !== optValue)
                : [...selectedValues, optValue];
            onChange(next);
        } else {
            onChange(optValue);
            setOpen(false);
        }
    };

    return (
        <div ref={containerRef} className={`settings-mobile-dropdown ${open ? 'is-open' : ''}`}>
            <button
                type="button"
                className={`settings-mobile-dropdown-trigger ${open ? 'is-focused' : ''}`}
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
            >
                <span className="settings-mobile-dropdown-value">{displayLabel}</span>
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
                <div className="settings-mobile-popover" role="listbox" aria-multiselectable={multiple}>
                    {options.length === 0 ? (
                        <div className="settings-mobile-empty">No options available.</div>
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
                                    className={`settings-mobile-option ${isSelected ? 'is-selected' : ''}`}
                                    onClick={() => handleSelectOption(optValue)}
                                >
                                    <span className="settings-mobile-option-label">{optLabel}</span>
                                    {isSelected && (
                                        <svg
                                            className="settings-mobile-check"
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

export default function Settings({ carServices: initialCarServices = [], motoServices: initialMotoServices = [] }) {
    const { flash } = usePage().props;

    const [carServices, setCarServices] = useState(initialCarServices);
    const [motoServices, setMotoServices] = useState(initialMotoServices);
    const [toastMessage, setToastMessage] = useState(null);

    const [carHovered, setCarHovered] = useState(false);
    const [motoHovered, setMotoHovered] = useState(false);

    const [carOpenMobile, setCarOpenMobile] = useState(false);
    const [motoOpenMobile, setMotoOpenMobile] = useState(false);

    const [tooltipOpen, setTooltipOpen] = useState(false);
    const tooltipRef = useRef(null);

    const [activeModal, setActiveModal] = useState(null);
    const [tempServices, setTempServices] = useState([]);
    const [isSavingServices, setIsSavingServices] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        interval_days: '',
        interval_odo: '',
    });
    const [emptyNameError, setEmptyNameError] = useState(false);
    const [shakeKey, setShakeKey] = useState(0);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
                setTooltipOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('touchstart', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('touchstart', handleOutsideClick);
        };
    }, []);

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
        setTooltipOpen(false);
        setEmptyNameError(false);
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
        setTooltipOpen(false);
        setEmptyNameError(false);
        setActiveModal(null);
        setTempServices([]);
        setNewItem({ name: '', interval_days: '', interval_odo: '' });
    };

    const handleAddItem = (e) => {
        e.preventDefault();
        if (!newItem.name.trim()) {
            setEmptyNameError(true);
            setShakeKey((k) => k + 1);
            return;
        }

        setEmptyNameError(false);
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
        if (isSavingServices) return;
        setIsSavingServices(true);
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
            },
            onFinish: () => {
                setIsSavingServices(false);
            }
        });
    };

    const renderServiceList = (list, type) => {
        if (list.length === 0) {
            return (
                <div style={styles.emptyContainer}>
                    <span style={styles.emptyStateText}>No services available</span>
                    <button onClick={(e) => openModal(type, e)} style={styles.primaryAddBtn} className="hover-btn">+ Add Services</button>
                </div>
            );
        }

        return (
            <>
                <div style={styles.verticalList} className="desktop-service-list">
                    {list.map((item) => (
                        <div key={item.id} style={styles.verticalItem} className="hover-list-item">
                            <span style={styles.verticalItemText}>{item.name}</span>
                            <div style={styles.intervalTagsGroup}>
                                {item.interval_days && <span style={styles.intervalBadge}>Every {formatIntervalDays(item.interval_days)}</span>}
                                {item.interval_odo && <span style={styles.intervalBadge}>Every {Number(item.interval_odo).toLocaleString()} ODO</span>}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mobile-service-card-list">
                    {list.map((item) => (
                        <div key={item.id} className="mobile-service-card">
                            <div className="mobile-service-card-header">
                                <div className="mobile-service-title-group">
                                    <h4 className="mobile-service-card-title">{item.name}</h4>
                                    <p className="mobile-service-card-sub">Maintenance Interval</p>
                                </div>
                            </div>
                            <div className="mobile-service-card-rows">
                                <div className="mobile-service-card-row">
                                    <span className="mobile-service-row-label">Every (Days)</span>
                                    <span className="mobile-service-row-val">
                                        {item.interval_days ? formatIntervalDays(item.interval_days) : '—'}
                                    </span>
                                </div>
                                <div className="mobile-service-card-row">
                                    <span className="mobile-service-row-label">Every (ODO)</span>
                                    <span className="mobile-service-row-val">
                                        {item.interval_odo ? `${Number(item.interval_odo).toLocaleString()} km` : '—'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        );
    };

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
                .btn-spinner {
                    animation: spinnerRotate 1.4s linear infinite;
                    width: 16px;
                    height: 16px;
                }
                .btn-spinner-circle {
                    animation: spinnerDash 1.2s ease-in-out infinite;
                    stroke-linecap: round;
                }
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
                    transform: translateY(-3px);
                    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -2px 0 rgba(0, 0, 0, 0.5), 0 12px 30px rgba(0, 0, 0, 0.6), 0 4px 8px rgba(47, 107, 255, 0.25);
                    border-color: #2F6BFF;
                }
                .hover-list-item {
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .hover-list-item:hover {
                    transform: translateX(4px);
                    background-color: rgba(47, 107, 255, 0.15) !important;
                    border-color: #2F6BFF !important;
                    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.4);
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
                .collapsible-wrapper {
                    display: grid;
                    grid-template-rows: 0fr;
                    transition: grid-template-rows 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    opacity: 0;
                    overflow: hidden;
                }
                .collapsible-wrapper.is-expanded {
                    grid-template-rows: 1fr;
                    opacity: 1;
                }
                .collapsible-inner {
                    min-height: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding-top: 4px;
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
                    background-color: #131722;
                    color: #FFFFFF;
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
                    border: 1px solid #252D45;
                    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -2px 0 rgba(0, 0, 0, 0.6), 0 8px 20px rgba(0, 0, 0, 0.8);
                    pointer-events: none;
                }
                .tooltip-container:hover .tooltip-text,
                .tooltip-container.tooltip-open .tooltip-text {
                    visibility: visible;
                    opacity: 1;
                }
                .mobile-service-card-list,
                .mobile-modal-card-list,
                .settings-mobile-dropdown {
                    display: none;
                }
                @media (min-width: 769px) {
                    .desktop-settings-card:hover .collapsible-wrapper {
                        grid-template-rows: 1fr;
                        opacity: 1;
                    }
                }
                @media (max-width: 768px) {
                    .page-layout {
                        flex-direction: column !important;
                    }
                    .mainContent {
                        padding: 16px 16px 92px 16px !important;
                    }
                    .tooltip-text {
                        top: calc(100% + 6px);
                        bottom: auto;
                        left: -12px;
                        transform: none;
                        width: 220px;
                        max-width: calc(100vw - 72px);
                    }
                    .settings-mobile-dropdown {
                        position: relative;
                        display: block;
                        width: 100%;
                    }
                    .settings-mobile-dropdown-trigger {
                        width: 100%;
                        background-color: #1B2030;
                        border: 1px solid #252D45;
                        border-radius: 10px;
                        padding: 10px 12px;
                        color: #FFFFFF;
                        font-size: 13px;
                        font-weight: 500;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 8px;
                        cursor: pointer;
                        box-sizing: border-box;
                        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -2px 0 rgba(0, 0, 0, 0.5), 0 2px 6px rgba(0, 0, 0, 0.3);
                        transition: border-color 0.18s ease, box-shadow 0.18s ease;
                        text-align: left;
                    }
                    .settings-mobile-dropdown-trigger.is-focused {
                        border-color: #2F6BFF;
                        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -2px 0 rgba(0, 0, 0, 0.5), 0 0 0 3px rgba(47, 107, 255, 0.25);
                    }
                    .settings-mobile-dropdown-value {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                    .settings-mobile-popover {
                        position: absolute;
                        top: calc(100% + 6px);
                        left: 0;
                        right: 0;
                        background-color: #131722;
                        border: 1px solid #252D45;
                        border-radius: 12px;
                        padding: 8px 6px 8px 8px;
                        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -2px 0 rgba(0, 0, 0, 0.6), 0 16px 32px rgba(0, 0, 0, 0.7);
                        z-index: 80;
                        max-height: 220px;
                        overflow-y: auto;
                        display: flex;
                        flex-direction: column;
                        gap: 4px;
                        box-sizing: border-box;
                    }
                    .settings-mobile-popover::-webkit-scrollbar {
                        width: 5px;
                    }
                    .settings-mobile-popover::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .settings-mobile-popover::-webkit-scrollbar-thumb {
                        background-color: #252D45;
                        border-radius: 999px;
                    }
                    .settings-mobile-option {
                        width: 100%;
                        background: transparent;
                        border: none;
                        border-radius: 8px;
                        padding: 9px 10px;
                        color: #FFFFFF;
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
                    .settings-mobile-option:hover {
                        background-color: #1B2030;
                    }
                    .settings-mobile-option.is-selected {
                        background-color: #1B2030;
                        color: #FFFFFF;
                        font-weight: 600;
                    }
                    .settings-mobile-option-label {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        flex: 1;
                    }
                    .settings-mobile-check {
                        color: #FFFFFF;
                        flex-shrink: 0;
                    }
                    .settings-mobile-empty {
                        padding: 12px;
                        text-align: center;
                        font-size: 12px;
                        color: #8A99C2;
                        font-style: italic;
                    }
                    .desktop-service-list,
                    .desktop-modal-list,
                    .desktop-modal-header {
                        display: none !important;
                    }
                    .mobile-service-card-list {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                        width: 100%;
                    }
                    .mobile-service-card {
                        background-color: #1B2030;
                        border: 1px solid #252D45;
                        border-radius: 10px;
                        padding: 12px 14px;
                        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -2px 0 rgba(0, 0, 0, 0.5), 0 4px 10px rgba(0, 0, 0, 0.4);
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                        box-sizing: border-box;
                    }
                    .mobile-service-card-header {
                        display: flex;
                        align-items: flex-start;
                        justify-content: space-between;
                        gap: 10px;
                    }
                    .mobile-service-title-group {
                        display: flex;
                        flex-direction: column;
                        gap: 2px;
                        min-width: 0;
                        flex: 1;
                    }
                    .mobile-service-card-title {
                        font-size: 13px;
                        font-weight: 700;
                        color: #FFFFFF;
                        margin: 0;
                        line-height: 1.3;
                    }
                    .mobile-service-card-sub {
                        font-size: 11px;
                        color: #8A99C2;
                        margin: 0;
                    }
                    .mobile-service-card-rows {
                        display: flex;
                        flex-direction: column;
                        gap: 6px;
                        padding-top: 8px;
                        border-top: 1px solid #252D45;
                    }
                    .mobile-service-card-row {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 10px;
                        font-size: 12px;
                    }
                    .mobile-service-row-label {
                        color: #8A99C2;
                        font-weight: 500;
                    }
                    .mobile-service-row-val {
                        color: #FFFFFF;
                        font-weight: 600;
                        text-align: right;
                    }
                    .modalBox {
                        max-width: 95vw !important;
                        padding: 16px !important;
                        border-radius: 14px !important;
                        max-height: 88vh !important;
                        overflow-y: auto !important;
                    }
                    .formRow {
                        flex-direction: column !important;
                        align-items: stretch !important;
                    }
                    .modalInput {
                        width: 100% !important;
                        flex: none !important;
                    }
                    .modalAddBtn {
                        width: 100% !important;
                    }
                    .mobile-modal-card-list {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                        max-height: 300px;
                        overflow-y: auto;
                        padding-right: 2px;
                    }
                    .mobile-modal-card {
                        background-color: #1B2030;
                        border: 1px solid #252D45;
                        border-radius: 10px;
                        padding: 12px;
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                        box-sizing: border-box;
                        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -2px 0 rgba(0, 0, 0, 0.5);
                    }
                    .mobile-modal-card-top {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 8px;
                    }
                    .mobile-modal-field-label {
                        font-size: 10px;
                        font-weight: 600;
                        text-transform: uppercase;
                        color: #8A99C2;
                        letter-spacing: 0.4px;
                    }
                    .mobile-modal-two-col {
                        display: grid;
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 8px;
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

            <Sidebar activePage="settings" />

            <div style={styles.mainContent} className="mainContent">
                <Toast message={toastMessage} duration={1000} onClose={() => setToastMessage(null)} />

                <Breadcrumb items={[{ label: 'Main', href: '/home' }, { label: 'Settings' }]} />

                <div style={styles.contentBody}>
                    <h1 style={styles.pageTitle}>Settings</h1>

                    <div style={styles.sectionBlock}>
                        <h2 style={styles.sectionHeaderTitle}>Services Configuration</h2>
                        <p style={styles.sectionHeaderDesc}>Configure maintenance service types and periodic intervals for your fleet vehicles.</p>

                        <div
                            style={styles.settingsCard}
                            className="interactive-card page-card-anim desktop-settings-card"
                            onMouseEnter={() => setCarHovered(true)}
                            onMouseLeave={() => setCarHovered(false)}
                        >
                            <div style={styles.cardTitleRow} onClick={() => setCarOpenMobile(!carOpenMobile)}>
                                <div style={styles.cardTitleLeft}>
                                    <svg
                                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A99C2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                        style={{ transform: (carHovered || carOpenMobile) ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
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

                            <div className={`collapsible-wrapper ${(carHovered || carOpenMobile) ? 'is-expanded' : ''}`}>
                                <div className="collapsible-inner">
                                    {renderServiceList(carServices, 'car')}
                                </div>
                            </div>
                        </div>

                        <div
                            style={styles.settingsCard}
                            className="interactive-card page-card-anim desktop-settings-card"
                            onMouseEnter={() => setMotoHovered(true)}
                            onMouseLeave={() => setMotoHovered(false)}
                        >
                            <div style={styles.cardTitleRow} onClick={() => setMotoOpenMobile(!motoOpenMobile)}>
                                <div style={styles.cardTitleLeft}>
                                    <svg
                                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A99C2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                        style={{ transform: (motoHovered || motoOpenMobile) ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
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

                            <div className={`collapsible-wrapper ${(motoHovered || motoOpenMobile) ? 'is-expanded' : ''}`}>
                                <div className="collapsible-inner">
                                    {renderServiceList(motoServices, 'moto')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {activeModal && (
                    <div style={styles.modalOverlay} className="animated-overlay">
                        <div style={styles.modalBox} className="animated-modal modalBox">
                            <div style={styles.modalHeader}>
                                <div style={styles.modalTitleWrapper}>
                                    <h3 style={styles.modalTitle}>
                                        {activeModal === 'car' ? 'Manage Car Services' : 'Manage Motorbike Services'}
                                    </h3>
                                    <div
                                        ref={tooltipRef}
                                        className={`tooltip-container ${tooltipOpen ? 'tooltip-open' : ''}`}
                                        style={styles.tooltipIconWrapper}
                                        onClick={() => setTooltipOpen((prev) => !prev)}
                                    >
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8A99C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'pointer' }}>
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

                            <form onSubmit={handleAddItem} style={styles.addItemForm} noValidate>
                                <div style={styles.formRow} className="formRow">
                                    <input
                                        key={emptyNameError ? `svc-name-${shakeKey}` : 'svc-name'}
                                        type="text"
                                        value={newItem.name}
                                        onChange={(e) => {
                                            setNewItem({ ...newItem, name: e.target.value });
                                            if (e.target.value.trim()) setEmptyNameError(false);
                                        }}
                                        placeholder="Service name (e.g. Oil Change)"
                                        style={{
                                            ...styles.modalInput,
                                            flex: 2,
                                            borderColor: emptyNameError ? '#FFA11A' : '#252D45',
                                        }}
                                        className={`modalInput ${emptyNameError ? 'shake-invalid' : ''}`}
                                    />
                                    <input
                                        type="text" value={newItem.interval_days}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (/^\d*$/.test(val)) setNewItem({ ...newItem, interval_days: val });
                                        }}
                                        placeholder="Days"
                                        style={{ ...styles.modalInput, flex: 1 }}
                                        className="modalInput"
                                    />
                                    <input
                                        type="text" value={newItem.interval_odo}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (/^\d*$/.test(val)) setNewItem({ ...newItem, interval_odo: val });
                                        }}
                                        placeholder="ODO"
                                        style={{ ...styles.modalInput, flex: 1 }}
                                        className="modalInput"
                                    />
                                    <button type="submit" style={styles.modalAddBtn} className="hover-btn modalAddBtn">Add</button>
                                </div>
                            </form>

                            <div style={styles.modalListHeader} className="desktop-modal-header">
                                <span style={{ flex: 2 }}>Service Name</span>
                                <span style={{ flex: 1 }}>Every (Days)</span>
                                <span style={{ flex: 1 }}>Every (ODO)</span>
                                <span style={{ width: '28px' }}></span>
                            </div>

                            <div style={styles.modalListContainer} className="desktop-modal-list">
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

                            <div className="mobile-modal-card-list">
                                {tempServices.length === 0 ? (
                                    <p style={styles.modalEmptyText}>No items added yet. You can save to clear the list.</p>
                                ) : (
                                    tempServices.map((item) => (
                                        <div key={item.id} className="mobile-modal-card">
                                            <div className="mobile-modal-card-top">
                                                <span className="mobile-modal-field-label">Service Name</span>
                                                <button onClick={() => handleRemoveTempItem(item.id)} style={styles.iconDeleteBtn} className="hover-btn" type="button" title="Remove item">
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                            <input
                                                type="text" value={item.name}
                                                onChange={(e) => handleUpdateTempItem(item.id, 'name', e.target.value)}
                                                placeholder="Service Name"
                                                style={{ ...styles.modalInlineInput, width: '100%' }}
                                            />
                                            <div className="mobile-modal-two-col">
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <span className="mobile-modal-field-label">Every (Days)</span>
                                                    <input
                                                        type="text" value={item.interval_days}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (/^\d*$/.test(val)) handleUpdateTempItem(item.id, 'interval_days', val);
                                                        }}
                                                        placeholder="Days"
                                                        style={{ ...styles.modalInlineInput, width: '100%' }}
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <span className="mobile-modal-field-label">Every (ODO)</span>
                                                    <input
                                                        type="text" value={item.interval_odo}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (/^\d*$/.test(val)) handleUpdateTempItem(item.id, 'interval_odo', val);
                                                        }}
                                                        placeholder="ODO"
                                                        style={{ ...styles.modalInlineInput, width: '100%' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div style={styles.modalActions}>
                                <button onClick={closeModal} style={styles.cancelBtn} className="hover-btn" type="button" disabled={isSavingServices}>Cancel</button>
                                <button onClick={handleSaveModal} style={styles.saveBtn} className="hover-btn" type="button" disabled={isSavingServices}>
                                    {isSavingServices ? (
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
    mainContent: { flex: 1, backgroundColor: '#090A10', height: '100vh', overflowY: 'auto', padding: '24px 36px', display: 'flex', flexDirection: 'column', position: 'relative', alignItems: 'center', boxSizing: 'border-box' },
    contentBody: { display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '750px', width: '100%', paddingBottom: '40px', margin: '0 auto' },
    pageTitle: { fontSize: '28px', fontWeight: '700', color: '#FFFFFF', letterSpacing: '-0.5px', margin: 0 },
    sectionBlock: { display: 'flex', flexDirection: 'column', gap: '16px' },
    sectionHeaderTitle: { color: '#FFFFFF', fontSize: '18px', fontWeight: '600', margin: 0 },
    sectionHeaderDesc: { color: '#8A99C2', fontSize: '13px', margin: '-10px 0 0 0' },
    settingsCard: {
        backgroundColor: '#131722', border: '1px solid #252D45', borderRadius: '12px',
        padding: '14px 20px', boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.5), 0 6px 16px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3)', display: 'flex', flexDirection: 'column', gap: '16px',
    },
    cardTitleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' },
    cardTitleLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
    cardTitleRight: { display: 'flex', alignItems: 'center' },
    cardTitle: { color: '#FFFFFF', fontSize: '15px', fontWeight: '600', margin: 0, lineHeight: '1.2' },
    iconEditBtn: {
        backgroundColor: '#1B2030', color: '#FFFFFF', border: '1px solid #252D45', width: '32px', height: '32px',
        borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
    },
    emptyContainer: {
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '12px', padding: '24px 0', border: '1px dashed #252D45', borderRadius: '8px', backgroundColor: '#1B2030',
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.4)',
    },
    emptyStateText: { color: '#8A99C2', fontSize: '13px', fontStyle: 'italic' },
    primaryAddBtn: { backgroundColor: '#2F6BFF', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -2px 0 rgba(0, 0, 0, 0.4), 0 4px 10px rgba(47, 107, 255, 0.3)' },
    verticalList: { display: 'flex', flexDirection: 'column', gap: '8px' },
    verticalItem: {
        backgroundColor: '#1B2030', border: '1px solid #252D45', borderRadius: '8px',
        padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06), inset 0 -1px 0 rgba(0, 0, 0, 0.3)',
    },
    verticalItemText: { color: '#FFFFFF', fontSize: '13px', fontWeight: '500' },
    intervalTagsGroup: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
    intervalBadge: { backgroundColor: 'rgba(47, 107, 255, 0.2)', color: '#FFFFFF', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px', flexShrink: 0, border: '1px solid rgba(47, 107, 255, 0.5)', boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)' },

    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px' },
    modalBox: {
        backgroundColor: '#131722', border: '1px solid #252D45', borderRadius: '14px',
        padding: '24px', width: '100%', maxWidth: '640px', boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 -2px 0 rgba(0, 0, 0, 0.6), 0 25px 50px rgba(0, 0, 0, 0.8), 0 4px 10px rgba(0, 0, 0, 0.5)',
        display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box',
    },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    modalTitleWrapper: { display: 'flex', alignItems: 'center', gap: '10px' },
    modalTitle: { color: '#FFFFFF', fontSize: '16px', fontWeight: '600', margin: 0 },
    tooltipIconWrapper: { display: 'flex', alignItems: 'center' },
    closeBtn: { background: 'none', border: 'none', color: '#8A99C2', fontSize: '16px', cursor: 'pointer' },
    addItemForm: { display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', boxSizing: 'border-box' },
    formRow: { display: 'flex', gap: '8px', width: '100%', alignItems: 'center', boxSizing: 'border-box', flexWrap: 'wrap' },
    modalInput: { backgroundColor: '#1B2030', border: '1px solid #252D45', borderRadius: '6px', padding: '8px 10px', color: '#FFFFFF', fontSize: '12px', outline: 'none', boxSizing: 'border-box', minWidth: '100px', transition: 'border-color 0.2s ease', boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)' },
    modalAddBtn: { backgroundColor: '#2F6BFF', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', flexShrink: 0, boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -2px 0 rgba(0, 0, 0, 0.4), 0 4px 10px rgba(47, 107, 255, 0.3)' },
    modalListHeader: { display: 'flex', gap: '8px', padding: '0 8px', color: '#8A99C2', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', boxSizing: 'border-box' },
    modalListContainer: { display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '260px', overflowY: 'auto', paddingRight: '4px', boxSizing: 'border-box' },
    modalEmptyText: { color: '#8A99C2', fontSize: '12px', textAlign: 'center', margin: '12px 0' },
    modalListItem: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#1B2030', border: '1px solid #252D45', borderRadius: '6px',
        padding: '6px 8px', gap: '8px', boxSizing: 'border-box', width: '100%',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06), inset 0 -1px 0 rgba(0, 0, 0, 0.3)',
    },
    modalInlineInput: { backgroundColor: '#131722', border: '1px solid #252D45', borderRadius: '4px', color: '#FFFFFF', fontSize: '12px', outline: 'none', padding: '6px 8px', boxSizing: 'border-box', boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.4)' },
    iconDeleteBtn: { backgroundColor: 'transparent', border: 'none', color: '#FFA11A', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.9, flexShrink: 0 },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #252D45', paddingTop: '14px', marginTop: '4px', boxSizing: 'border-box' },
    cancelBtn: { backgroundColor: '#1B2030', color: '#FFFFFF', border: '1px solid #252D45', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)' },
    saveBtn: { backgroundColor: '#2F6BFF', color: '#FFFFFF', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '95px', minHeight: '26px', boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -2px 0 rgba(0, 0, 0, 0.4), 0 4px 10px rgba(47, 107, 255, 0.3)' },
};