import React from 'react';
import { Send, Edit, Download, Settings } from 'lucide-react';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import PaymentTemplateSelector from './PaymentTemplateSelector';
import TemplatePreview from '../Templates/TemplatePreview';
import usePaymentPreview from '../../hooks/payments/usePaymentPreview';
import PageHeader from '../common/PageHeader';



const PaymentPreview: React.FC = () => {
    const {
        payment,
        templatesLoading,
        mappedInvoiceData,
        showTemplateSelector,
        setShowTemplateSelector,
        handleTemplateSelect,
        handleSendClick,
        handleBackClick,
        handleEdit,
        handleDownloadPDF,
        activeTemplate
    } = usePaymentPreview();


    if (!payment) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">No payment data available</p>
                    <Button onClick={handleBackClick} variant="secondary">
                        Back to Payments
                    </Button>
                </div>
            </div>
        );
    }

    if (templatesLoading && !activeTemplate) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Template Selector Modal */}
            <PaymentTemplateSelector
                isOpen={showTemplateSelector}
                onClose={() => setShowTemplateSelector(false)}
                onSelect={handleTemplateSelect}
                currentTemplateId={payment.templateId?.toString() || payment.template?.id?.toString()}
            />

            <PageHeader
                title={`Payment ${payment.paymentNumber}`}
                showBackButton={true}
                onBack={handleBackClick}
                actions={
                    <>
                        <Button
                            onClick={handleDownloadPDF}
                            variant="secondary"
                            size="md"
                            className='!bg-blue-600 !border !border-blue-600'
                            icon={<Download className="w-4 h-4" />}
                        >
                            Download
                        </Button>
                        <Button
                            onClick={() => handleEdit(payment.id)}
                            variant="secondary"
                            size="md"
                            icon={<Edit className="w-4 h-4" />}
                        >
                            Edit
                        </Button>
                        <Button
                            onClick={handleSendClick}
                            variant="primary"
                            size="md"
                            icon={<Send className="w-4 h-4" />}
                        >
                            Send
                        </Button>
                    </>
                }
            />

            <div className="px-6 py-10 font-sans">
                <div className="relative mx-auto max-w-[210mm]">
                    {/* Status Ribbon */}
                    {payment?.status && (
                        <div className="absolute top-0 left-0 w-32 h-32 overflow-hidden pointer-events-none z-10 -mt-[6px] -ml-[6px]">
                            <div className={`absolute top-7 -left-10 w-36 py-1 text-center text-[10px] font-bold uppercase tracking-wider text-white transform -rotate-45 shadow-md z-10 ${payment.status.toLowerCase() === 'draft' ? 'bg-gray-400' :
                                payment.status.toLowerCase() === 'sent' ? 'bg-blue-500' :
                                    payment.status.toLowerCase() === 'paid' ? 'bg-green-500' :
                                        payment.status.toLowerCase() === 'partial' ? 'bg-yellow-500' :
                                            'bg-gray-400'
                                }`}>
                                {payment.status}
                            </div>
                        </div>
                    )}

                    {/* Customize Template Button */}
                    <div className="absolute top-0 right-0 z-20">
                        <div className="relative">
                            <button
                                onClick={() => setShowTemplateSelector(true)}
                                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 shadow-md transition-all text-sm font-medium pr-3"
                            >
                                <Settings className="w-4 h-4" />
                                <span>Customize</span>
                            </button>
                        </div>
                    </div>

                    <div id="pdf-print-area" className="shadow-lg bg-white relative" style={{ minHeight: '296mm' }}>
                        {activeTemplate && mappedInvoiceData ? (
                            <TemplatePreview
                                data={activeTemplate}
                                invoice={mappedInvoiceData}
                            />
                        ) : (
                            <div className="bg-white p-10 text-center">
                                No template found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPreview;
