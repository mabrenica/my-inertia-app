import { Link } from '@inertiajs/react';

export default function Breadcrumb({ items = [] }) {
    if (!items || items.length === 0) return null;

    return (
        <nav style={styles.nav} aria-label="Breadcrumb">
            <ol style={styles.list}>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <li key={index} style={styles.item}>
                            {index > 0 && (
                                <span style={styles.separator} aria-hidden="true">/</span>
                            )}
                            {item.href && !isLast ? (
                                <Link href={item.href} style={styles.link} className="breadcrumb-link">
                                    {item.label}
                                </Link>
                            ) : (
                                <span style={styles.current}>{item.label}</span>
                            )}
                        </li>
                    );
                })}
            </ol>
            <style>{`
                .breadcrumb-link {
                    transition: color 0.15s ease;
                }
                .breadcrumb-link:hover {
                    color: #2F6BFF !important;
                }
            `}</style>
        </nav>
    );
}

const styles = {
    nav: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
        width: '100%',
        boxSizing: 'border-box',
    },
    list: {
        display: 'flex',
        alignItems: 'center',
        listStyle: 'none',
        margin: 0,
        padding: 0,
        gap: '8px',
        flexWrap: 'wrap',
    },
    item: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
    },
    separator: {
        color: '#7B8AB8',
        fontSize: '12px',
        userSelect: 'none',
    },
    link: {
        color: '#8A99C2',
        textDecoration: 'none',
        fontWeight: '500',
    },
    current: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
};