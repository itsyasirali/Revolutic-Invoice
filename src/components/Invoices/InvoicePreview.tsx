import React from 'react';
import { Send, Edit, FileText, Download, Settings } from 'lucide-react';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import PageHeader from '../common/PageHeader';
import TemplatePreviewComponent from '../Templates/TemplatePreview';
import LoadingSpinner from '../common/LoadingSpinner';
import InvoiceTemplateSelector from './InvoiceTemplateSelector';
import { useInvoicePreview } from '../../hooks/invoices/useInvoicePreview';

const InvoicePreview: React.FC = () => {
    const {
        invoice,
        templateData,
        templatesLoading,
        showTemplateSelector,
        setShowTemplateSelector,
        handleEdit,
        handleSend,
        handleTemplateSelect,
        handleBackClick,
        handleDownloadPDF,
        activeTemplate
    } = useInvoicePreview();


    if (!invoice) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <EmptyState
                    icon={FileText}
                    title="Invoice Not Found"
                    message="The invoice you're looking for doesn't exist or data is not available."
                    action={{
                        label: 'Back to Invoices',
                        onClick: handleBackClick,
                    }}
                />
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
            <InvoiceTemplateSelector
                isOpen={showTemplateSelector}
                onClose={() => setShowTemplateSelector(false)}
                onSelect={handleTemplateSelect}
                currentTemplateId={String(templateData?.id)}
            />

            <PageHeader
                title={`Invoice ${invoice.invoiceNumber}`}
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
                            onClick={handleEdit}
                            variant="secondary"
                            size="md"
                            icon={<Edit className="w-4 h-4" />}
                        >
                            Edit
                        </Button>
                        <Button
                            onClick={handleSend}
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
                    {invoice?.status && (
                        <div className="absolute top-0 left-0 w-32 h-32 overflow-hidden pointer-events-none z-10 -mt-[6px] -ml-[6px]">
                            <div className={`absolute top-7 -left-10 w-40 py-1 text-center text-[10px] font-bold uppercase tracking-wider text-white transform -rotate-45 shadow-md z-10 ${invoice.status.toLowerCase() === 'draft' ? 'bg-gray-400' :
                                invoice.status.toLowerCase() === 'sent' ? 'bg-blue-500' :
                                    invoice.status.toLowerCase() === 'paid' ? 'bg-green-500' :
                                        invoice.status.toLowerCase() === 'overdue' ? 'bg-red-500' :
                                            'bg-gray-400'
                                }`}>
                                {invoice.status}
                            </div>
                            {/* Folds to create wrap-around effect */}
                            <div className={`absolute top-[48px] left-0 border-r-[6px] border-b-[6px] border-r-transparent brightness-75 ${invoice.status.toLowerCase() === 'draft' ? 'border-b-gray-600' :
                                invoice.status.toLowerCase() === 'sent' ? 'border-b-blue-700' :
                                    invoice.status.toLowerCase() === 'paid' ? 'border-b-green-700' :
                                        invoice.status.toLowerCase() === 'overdue' ? 'border-b-red-700' :
                                            'border-b-gray-600'
                                }`} />
                            <div className={`absolute top-0 left-[48px] border-l-[6px] border-b-[6px] border-b-transparent brightness-75 ${invoice.status.toLowerCase() === 'draft' ? 'border-l-gray-600' :
                                invoice.status.toLowerCase() === 'sent' ? 'border-l-blue-700' :
                                    invoice.status.toLowerCase() === 'paid' ? 'border-l-green-700' :
                                        invoice.status.toLowerCase() === 'overdue' ? 'border-l-red-700' :
                                            'border-l-gray-600'
                                }`} />
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
                        {templateData ? (
                            <TemplatePreviewComponent
                                data={templateData}
                                invoice={invoice}
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

export default InvoicePreview;
