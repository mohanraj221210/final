import React from 'react';

const Loader: React.FC = () => {
    return (
        <div className="loader-container">
            <div className="spinner"></div>
            <style>{`
                .loader-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 200px;
                    width: 100%;
                }
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3b82f6; /* Primary Blue */
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Loader;
