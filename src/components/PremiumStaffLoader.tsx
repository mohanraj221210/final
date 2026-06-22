import React, { useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface PremiumStaffLoaderProps {
    isDataReady: boolean;
    onComplete: () => void;
}

const PremiumStaffLoader: React.FC<PremiumStaffLoaderProps> = ({ isDataReady, onComplete }) => {
    useEffect(() => {
        if (isDataReady) {
            // Short delay to ensure a smooth transition
            const timer = setTimeout(() => {
                onComplete();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isDataReady, onComplete]);

    // We use the simple LoadingSpinner instead of a complex full-screen animation
    return <LoadingSpinner />;
};

export default PremiumStaffLoader;
