import React from 'react';
import { Send, Edit, FileText, Download, Settings } from 'lucide-react';
import { Button, EmptyState, PageHeader, LoadingSpinner } from '../ui';
import TemplatePreviewComponent from '../Templates/TemplatePreview';
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
                        <div className="absolute top-0 left-0 w-28 h-28 overflow-hidden pointer-events-none z-10">
                            <div className={`absolute top-[18px] -left-[38px] w-[140px] py-1 text-center text-[10px] font-bold uppercase tracking-wider text-white transform -rotate-45 shadow-sm z-10 ${invoice.status.toLowerCase() === 'draft' ? 'bg-slate-500' :
                                invoice.status.toLowerCase() === 'sent' ? 'bg-blue-600' :
                                    invoice.status.toLowerCase() === 'paid' ? 'bg-emerald-600' :
                                        invoice.status.toLowerCase() === 'overdue' ? 'bg-rose-600' :
                                            'bg-slate-500'
                                }`}>
                                {invoice.status}
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
