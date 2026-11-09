import { Link } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';

export default function VehicleShow({ vehicle }) {
    const photoUrl = vehicle.photo ? `/storage/${vehicle.photo}` : null;

    return (
        <div style={styles.page}>
            <div style={styles.appWindow}>
                <Sidebar activePage="home" />

                <div style={styles.mainContent}>
                    <div style={styles.topBar}>
                        <div style={styles.breadcrumb}>
                            <Link href="/home" style={styles.breadcrumbLink}>Main / Home</Link> / <span style={{ color: '#ffffff', fontWeight: '500' }}>{vehicle.make} {vehicle.model}</span>
                        </div>
                        <Link href="/home" style={styles.backButton}>
                            ← Back to Rides
                        </Link>
                    </div>

                    <div style={styles.contentBody}>
                        <h1 style={styles.pageTitle}>{vehicle.year} {vehicle.make} {vehicle.model}</h1>

                        <div style={styles.profileCard}>
                            <div style={styles.photoContainer}>
                                {photoUrl ? (
                                    <img src={photoUrl} alt={vehicle.make} style={styles.vehiclePhoto} />
                                ) : (
                                    <div style={styles.placeholderPhoto}>
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2.5-4.5c-.3-.5-.9-.8-1.5-.8H10c-.6 0-1.2.3-1.5.8L6 10l-2.5 1.1C2.7 12.3 2 13.1 2 14v3c0 .6.4 1 1 1h2"></path>
                                            <circle cx="7" cy="17" r="2"></circle>
                                            <circle cx="17" cy="17" r="2"></circle>
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <div style={styles.detailsGrid}>
                                <div style={styles.detailRow}>
                                    <span style={styles.key}>Vehicle Type:</span>
                                    <span style={styles.value}>
                                        <span style={styles.typeBadge}>{vehicle.type}</span>
                                    </span>
                                </div>
                                <div style={styles.detailRow}>
                                    <span style={styles.key}>Make:</span>
                                    <span style={styles.value}>{vehicle.make}</span>
                                </div>
                                <div style={styles.detailRow}>
                                    <span style={styles.key}>Model:</span>
                                    <span style={styles.value}>{vehicle.model}</span>
                                </div>
                                <div style={styles.detailRow}>
                                    <span style={styles.key}>Year:</span>
                                    <span style={styles.value}>{vehicle.year}</span>
                                </div>
                                <div style={styles.detailRow}>
                                    <span style={styles.key}>Description / Notes:</span>
                                    <span style={styles.value}>{vehicle.description || 'No description provided.'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
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
    mainContent: { flex: 1, backgroundColor: '#0d1117', overflowY: 'auto', padding: '24px 36px', display: 'flex', flexDirection: 'column' },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    breadcrumb: { fontSize: '12px', color: '#8b949e' },
    breadcrumbLink: { color: '#8b949e', textDecoration: 'none' },
    backButton: { backgroundColor: '#21262d', color: '#c9d1d9', border: '1px solid #30363d', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', textDecoration: 'none' },
    contentBody: { display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px' },
    pageTitle: { fontSize: '28px', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.5px', margin: 0 },
    profileCard: { backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', display: 'flex', flexDirection: 'column', gap: '20px' },
    photoContainer: { width: '100%', height: '260px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#0d1117', border: '1px solid #30363d', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    vehiclePhoto: { width: '100%', height: '100%', objectFit: 'cover' },
    placeholderPhoto: { width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    detailsGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
    detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', padding: '10px 0', borderBottom: '1px solid #21262d' },
    key: { color: '#8b949e', flexBasis: '35%' },
    value: { color: '#c9d1d9', fontWeight: '500', flexBasis: '65%', textAlign: 'right' },
    typeBadge: { display: 'inline-block', backgroundColor: '#1f6feb22', color: '#3b82f6', fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' },
};