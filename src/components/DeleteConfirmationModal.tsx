import React from 'react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
    itemType: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    itemType
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Confirm Deletion</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <div className="warning-icon-container">
                        <span className="warning-icon">⚠️</span>
                    </div>
                    <h4>Are you sure?</h4>
                    <p>
                        You are about to delete the {itemType.toLowerCase()} <strong>"{itemName}"</strong>.
                        This action cannot be undone.
                    </p>
                </div>
                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-danger" onClick={onConfirm}>Delete {itemType}</button>
                </div>
            </div>
            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                    animation: fadeIn 0.2s ease-out;
                }

                .modal-content {
                    background: white;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 400px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    overflow: hidden;
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .modal-header {
                    padding: 16px 20px;
                    border-bottom: 1px solid #f3f4f6;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modal-header h3 {
                    margin: 0;
                    font-size: 1.1rem;
                    color: #111827;
                    font-weight: 600;
                }

                .close-btn {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    color: #9ca3af;
                    cursor: pointer;
                    padding: 0;
                    line-height: 1;
                    transition: color 0.2s;
                }

                .close-btn:hover {
                    color: #ef4444;
                }

                .modal-body {
                    padding: 24px 20px;
                    text-align: center;
                }

                .warning-icon-container {
                    width: 50px;
                    height: 50px;
                    background: #fef2f2;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 16px;
                }

                .warning-icon {
                    font-size: 24px;
                }

                .modal-body h4 {
                    margin: 0 0 8px;
                    font-size: 1.25rem;
                    color: #1f2937;
                }

                .modal-body p {
                    margin: 0;
                    color: #6b7280;
                    line-height: 1.5;
                }

                .modal-footer {
                    padding: 16px 20px;
                    background: #f9fafb;
                    border-top: 1px solid #f3f4f6;
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }

                .btn-secondary {
                    padding: 8px 16px;
                    background: white;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    color: #374151;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-secondary:hover {
                    background: #f3f4f6;
                }

                .btn-danger {
                    padding: 8px 16px;
                    background: #ef4444;
                    border: 1px solid transparent;
                    border-radius: 6px;
                    color: white;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 2px 4px rgba(239, 68, 68, 0.1);
                }

                .btn-danger:hover {
                    background: #dc2626;
                    box-shadow: 0 4px 6px rgba(239, 68, 68, 0.2);
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
};

export default DeleteConfirmationModal;
