import React from 'react';
import { X } from 'lucide-react';
import usePaymentTemplateSelector from '../../hooks/payments/usePaymentTemplateSelector';

import TemplateCard from '../Templates/TemplateCard';
import LoadingSpinner from '../common/LoadingSpinner';


interface PaymentTemplateSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (template: any) => void;
    currentTemplateId?: string;
}

const PaymentTemplateSelector: React.FC<PaymentTemplateSelectorProps> = ({
    isOpen,
    onClose,
    onSelect,
    currentTemplateId,
}) => {
    const {
        templates,
        loading,
        error,
        selectedId,
        handleSelect
    } = usePaymentTemplateSelector(currentTemplateId);

    if (!isOpen) return null;


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Select Template</h2>
                        <p className="text-gray-500 mt-1">Choose a design for this payment receipt</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <LoadingSpinner />
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-600 p-8">
                            Failed to load templates: {error}
                        </div>
                    ) : (
                        <div className="grid xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {templates.map((template, index) => (
                                <TemplateCard
                                    key={template.id}
                                    template={template}
                                    index={index}
                                    onEdit={() => { }} // No-op in select mode
                                    onSetActive={() => { }} // No-op
                                    onPreview={() => { }} // No-op, selection is the action
                                    mode="select"
                                    selected={selectedId === template.id}
                                    onClick={() => handleSelect(template, onSelect, onClose)}

                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentTemplateSelector;
