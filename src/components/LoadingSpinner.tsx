import React from 'react';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="premium-loader-overlay">
            <div className="skeleton-overlay">
                <div className="skeleton-grid">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="skeleton-card shimmer" style={{ animationDelay: `${i * 0.1}s` }}>
                            <div className="sk-avatar shimmer"></div>
                            <div className="sk-lines">
                                <div className="sk-line w-3-4 shimmer"></div>
                                <div className="sk-line w-1-2 shimmer"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="loader-content">
                <div className="logo-pulse-container">
                    <div className="pulse-ring ring-1"></div>
                    <div className="pulse-ring ring-2"></div>
                    <div className="logo-box">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="logo-icon">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                    </div>
                </div>
                
                <div className="text-container">
                    <h2 className="loading-title">JIT PERMIGO</h2>
                    <p className="loading-subtitle">Preparing your workspace<span className="dots">...</span></p>
                </div>
            </div>

            <style>{`
                .premium-loader-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                }

                .loader-content {
                    position: relative;
                    z-index: 10;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 28px;
                    background: rgba(255, 255, 255, 0.75);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    padding: 40px;
                    border-radius: 32px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                .logo-pulse-container {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .pulse-ring {
                    position: absolute;
                    inset: 0;
                    border-radius: 50%;
                    border: 2px solid #3b82f6;
                    opacity: 0;
                }

                .ring-1 {
                    animation: pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }

                .ring-2 {
                    animation: pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                    animation-delay: 1s;
                }

                .logo-box {
                    position: relative;
                    width: 64px;
                    height: 64px;
                    background: linear-gradient(135deg, #2563eb, #1d4ed8);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4);
                    animation: floatLogo 3s ease-in-out infinite;
                }

                .text-container {
                    text-align: center;
                }

                .loading-title {
                    margin: 0 0 8px 0;
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: #0f172a;
                    letter-spacing: -0.03em;
                    background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .loading-subtitle {
                    margin: 0;
                    font-size: 0.95rem;
                    color: #64748b;
                    font-weight: 500;
                }

                .dots {
                    display: inline-block;
                    width: 12px;
                    text-align: left;
                    animation: typingDots 1.5s infinite steps(4, end);
                    overflow: hidden;
                    vertical-align: bottom;
                }

                /* Skeleton Background Overlay */
                .skeleton-overlay {
                    position: absolute;
                    inset: 0;
                    padding: 40px;
                    z-index: 1;
                    opacity: 0.5;
                    pointer-events: none;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    mask-image: radial-gradient(circle at center, transparent 20%, black 100%);
                    -webkit-mask-image: radial-gradient(circle at center, transparent 20%, black 100%);
                }

                .skeleton-grid {
                    width: 100%;
                    max-width: 1200px;
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 24px;
                    margin-top: 60px;
                }

                .skeleton-card {
                    background: rgba(255, 255, 255, 0.6);
                    border-radius: 24px;
                    padding: 24px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.8);
                }

                .sk-avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: #e2e8f0;
                }

                .sk-lines {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .sk-line {
                    height: 10px;
                    background: #e2e8f0;
                    border-radius: 6px;
                }

                .w-3-4 { width: 75%; }
                .w-1-2 { width: 50%; }

                .shimmer {
                    position: relative;
                    overflow: hidden;
                }

                .shimmer::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    transform: translateX(-100%);
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
                    animation: shimmerEffect 2s infinite;
                }

                @keyframes pulseRing {
                    0% { transform: scale(0.8); opacity: 0.8; }
                    100% { transform: scale(1.8); opacity: 0; }
                }

                @keyframes floatLogo {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }

                @keyframes slideUpFade {
                    from { opacity: 0; transform: translateY(30px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                @keyframes shimmerEffect {
                    100% { transform: translateX(100%); }
                }

                @keyframes typingDots {
                    0%, 20% { width: 0; }
                    40% { width: 4px; }
                    60% { width: 8px; }
                    80%, 100% { width: 12px; }
                }

                @media (max-width: 768px) {
                    .loader-content {
                        padding: 32px 24px;
                        width: 85%;
                        max-width: 320px;
                        border-radius: 28px;
                    }
                    .skeleton-overlay {
                        padding: 20px;
                        mask-image: radial-gradient(ellipse at center, transparent 35%, black 100%);
                        -webkit-mask-image: radial-gradient(ellipse at center, transparent 35%, black 100%);
                    }
                    .skeleton-grid {
                        grid-template-columns: 1fr;
                        margin-top: 40px;
                    }
                }
            `}</style>
        </div>
    );
};

export default LoadingSpinner;
