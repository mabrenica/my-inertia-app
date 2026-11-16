import { Link } from '@inertiajs/react';

export default function Breadcrumb({ items = [] }) {
    return (
        <>
            <style>{`
                @media (max-width: 768px) {
                    .mobile-hide-breadcrumb {
                        display: none !important;
                    }
                }
            `}</style>

            <nav aria-label="Breadcrumb" className="mobile-hide-breadcrumb" style={styles.container}>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <span key={index} style={styles.itemWrapper}>
                            {item.href && !isLast ? (
                                <Link href={item.href} style={styles.link}>
                                    {item.label}
                                </Link>
                            ) : (
                                <span style={isLast ? styles.active : styles.label}>
                                    {item.label}
                                </span>
                            )}
                            {!isLast && <span style={styles.separator}>/</span>}
                        </span>
                    );
                })}
            </nav>
        </>
    );
}

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: '6px',
        fontSize: '12px',
        color: '#6e6962',
        marginBottom: '12px',
    },
    itemWrapper: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
    },
    link: {
        color: '#6e6962',
        textDecoration: 'none',
        fontWeight: '500',
    },
    label: {
        color: '#6e6962',
        fontWeight: '500',
    },
    active: {
        color: '#1c1c1c',
        fontWeight: '600',
    },
    separator: {
        color: '#a39b8e',
    },
};