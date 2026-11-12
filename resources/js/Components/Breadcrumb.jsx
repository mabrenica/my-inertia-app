import { Link } from '@inertiajs/react';

export default function Breadcrumb({ items = [] }) {
    return (
        <div style={styles.topBar}>
            <div style={styles.breadcrumb}>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <span key={index}>
                            {index > 0 && ' / '}
                            {item.href && !isLast ? (
                                <Link href={item.href} style={styles.breadcrumbLink}>{item.label}</Link>
                            ) : (
                                <span style={isLast ? styles.currentLabel : styles.breadcrumbLink}>{item.label}</span>
                            )}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}

const styles = {
    topBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        width: '100%',
        maxWidth: '900px',
        boxSizing: 'border-box',
    },
    breadcrumb: {
        fontSize: '12px',
        color: '#6e6962',
    },
    breadcrumbLink: {
        color: '#6e6962',
        textDecoration: 'none',
        transition: 'color 0.2s ease',
    },
    currentLabel: {
        color: '#1c1c1c',
        fontWeight: '500',
    },
};