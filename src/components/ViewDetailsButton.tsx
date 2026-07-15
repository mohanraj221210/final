import React from 'react';
import { Eye } from 'lucide-react';
import './ViewDetailsButton.css';

interface ViewDetailsButtonProps {
    onClick: () => void;
    label?: string;
    compact?: boolean;
    className?: string;
}

const ViewDetailsButton: React.FC<ViewDetailsButtonProps> = ({
    onClick,
    label = 'View Details',
    compact = false,
    className = ''
}) => (
    <button
        type="button"
        className={`view-details-btn${compact ? ' view-details-btn--compact' : ''} ${className}`.trim()}
        onClick={onClick}
    >
        <Eye size={compact ? 13 : 14} strokeWidth={2.25} aria-hidden="true" />
        <span>{label}</span>
    </button>
);

export default ViewDetailsButton;
