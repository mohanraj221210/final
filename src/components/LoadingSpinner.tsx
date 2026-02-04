import React from 'react';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
            <style>{`
                .loading-spinner-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    width: 100%;
                    background: rgba(255, 255, 255, 0.8);
                    position: fixed;
                    top: 0;
                    left: 0;
                    z-index: 9999;
                }
                
                .loading-spinner {
                    border: 4px solid rgba(0, 0, 0, 0.1);
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border-left-color: #09f;
                    animation: spin 1s linear infinite;
                    margin-bottom: 15px;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .loading-spinner-container p {
                    font-family: 'Poppins', sans-serif;
                    color: #555;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
};

export default LoadingSpinner;
