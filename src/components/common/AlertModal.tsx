import React from 'react';
import ConfirmDialog from './ConfirmDialog';

interface AlertModalProps {
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    onClose: () => void;
    title?: string;
}

const AlertModal: React.FC<AlertModalProps> = ({
    isOpen,
    type,
    message,
    onClose,
    title,
}) => {
    const getTitle = () => {
        if (title) return title;
        switch (type) {
            case 'success': return 'Success';
            case 'error': return 'Error';
            case 'warning': return 'Warning';
            default: return 'Information';
        }
    };

    return (
        <ConfirmDialog
            isOpen={isOpen}
            title={getTitle()}
            message={message}
            confirmText="OK"
            cancelText=""
            type={type === 'error' ? 'danger' : type}
            onConfirm={onClose}
            onCancel={onClose}
        />
    );
};

export default AlertModal;
