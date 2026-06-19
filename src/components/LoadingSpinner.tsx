import React from 'react';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="pb-loading-page">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                {/* Animated logo mark */}
                <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(96,165,250,0.06))',
                    border: '1px solid rgba(59,130,246,0.15)',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pbPulseScale 1.8s ease-in-out infinite',
                }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                </div>
                {/* Spinner */}
                <div className="pb-loading-spinner" />
                {/* Text */}
                <div style={{ textAlign: 'center', gap: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span className="pb-loading-text">Loading your portal...</span>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>JIT Campus One</span>
                </div>
            </div>

            {/* Skeleton preview cards */}
            <div style={{ width: '100%', maxWidth: '360px', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="pb-skeleton-card">
                    <div className="pb-skeleton" style={{ height: '14px', width: '60%' }} />
                    <div className="pb-skeleton" style={{ height: '10px', width: '40%' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="pb-skeleton-card" style={{ padding: '14px', alignItems: 'center', minHeight: '72px' }}>
                            <div className="pb-skeleton" style={{ width: '36px', height: '36px', borderRadius: '10px' }} />
                            <div className="pb-skeleton" style={{ height: '8px', width: '80%' }} />
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes pbPulseScale {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.06); opacity: 0.85; }
                }
            `}</style>
        </div>
    );
};

export default LoadingSpinner;
