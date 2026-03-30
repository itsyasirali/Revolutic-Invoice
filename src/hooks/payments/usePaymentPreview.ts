import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import type { Payment } from '../../types/Payment.d';
import usePaymentActions from './usePaymentActions';
import useTemplates from './useTemplates';

export interface UsePaymentPreviewReturn {
    id: string | undefined;
    payment: Payment | null;
    templates: any[];
    templatesLoading: boolean;
    selectedTemplate: any;
    mappedInvoiceData: any;
    showTemplateSelector: boolean;
    setShowTemplateSelector: (show: boolean) => void;
    availableRecipients: string[];
    selectedRecipients: string[];
    handleRecipientToggle: (email: string) => void;
    handleTemplateSelect: (template: any) => Promise<void>;
    handleSendClick: () => void;
    handleDownloadPDF: () => Promise<void>;
    handleBackClick: () => void;
    handleEdit: (id: string) => void;
    activeTemplate: any;
}

const usePaymentPreview = (): UsePaymentPreviewReturn => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const payment: Payment | null = location.state?.payment || null;

    const navigate = useNavigate();

    const { handleBackToList, handleEdit, updateTemplate } = usePaymentActions();
    const { templates, loading: templatesLoading, defaultTemplate } = useTemplates();

    const [showTemplateSelector, setShowTemplateSelector] = useState(false);
    const [availableRecipients, setAvailableRecipients] = useState<string[]>([]);
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

    // Extract available emails from payment
    useEffect(() => {
        if (payment) {
            const emails: string[] = [];

            if (payment.customerEmail) {
                emails.push(payment.customerEmail);
            }

            if (payment.customer?.email && !emails.includes(payment.customer.email)) {
                emails.push(payment.customer.email);
            }

            if (payment.customer?.contacts && Array.isArray(payment.customer.contacts)) {
                payment.customer.contacts.forEach((c: any) => {
                    if (c.email && !emails.includes(c.email)) {
                        emails.push(c.email);
                    }
                });
            }

            setAvailableRecipients(emails);
            setSelectedRecipients(emails);
        }
    }, [payment]);

    // Handle recipient selection toggle
    const handleRecipientToggle = (email: string) => {
        setSelectedRecipients(prev =>
            prev.includes(email)
                ? prev.filter(e => e !== email)
                : [...prev, email]
        );
    };

    // Select the appropriate template
    const selectedTemplate = useMemo(() => {
        let baseTemplate = null;

        if (payment) {
            // Priority 1: Use template directly from payment object if available
            if (payment.template && typeof payment.template === 'object') {
                baseTemplate = 'raw' in payment.template ? payment.template.raw : payment.template;
            }

            // Priority 2: Look up by ID from templates list
            if (!baseTemplate && templates.length > 0) {
                const templateId = payment.templateId?.toString() || payment.template?.id?.toString();
                if (templateId) {
                    const found = templates.find(t => t.id === templateId);
                    if (found) baseTemplate = found.raw;
                }
            }

            // Priority 3: Default template
            if (!baseTemplate && defaultTemplate) {
                baseTemplate = defaultTemplate.raw;
            }

            // Final fallback: first template
            if (!baseTemplate) {
                baseTemplate = templates[0]?.raw || null;
            }
        }

        if (baseTemplate) {
            // Override table columns for Payment Preview to be static 3 columns
            // And override labels to match Payment Receipt format
            return {
                ...baseTemplate,
                invoiceLabel: 'PAYMENT',
                invoiceDateLabel: 'Payment Date',
                termsLabel: 'Payment Mode',
                dueDateLabel: 'Reference#',
                subtotalLabel: 'Amount Received',
                balanceDueLabel: 'Total',
                showTotal: false, // Hide the middle "Total" line to match image which only has "Amount Received" then the "Total" box
                showPreviousDue: false, // Ensure this is hidden
                showNotes: false, // Hide notes as requested
                tableColumnSettings: [], // Clear settings to avoid conflict
                tableColumns: [
                    { key: 'invoiceNumber', label: 'Invoice Number', width: 200, align: 'left', enabled: true },
                    { key: 'invoiceAmount', label: 'Invoice Amount', width: 150, align: 'right', enabled: true },
                    { key: 'paymentAmount', label: 'Payment Amount', width: 150, align: 'right', enabled: true },
                ]
            };
        }

        return null;
    }, [payment, templates, defaultTemplate]);

    // Map payment data to invoice-like structure expected by TemplatePreview
    const mappedInvoiceData = useMemo(() => {
        if (!payment) return null;

        return {
            invoiceNumber: `#${payment.paymentNumber}` || 'N/A', // #1 format
            invoiceDate: payment.paymentDate,
            formattedDueDate: payment.referenceNo || 'N/A', // Mapped to Reference#
            terms: payment.paymentMode || 'N/A', // Mapped to Payment Mode
            customerId: payment.customer,
            customerDisplayName: payment.customerDisplayName,
            customerAddress: payment.customer?.address || '',
            customerEmail: payment.customerEmail,
            customer: payment.customer,
            items: (payment.appliedInvoices || []).map((applied: any) => ({
                invoiceNumber: applied.invoiceNumber || applied.invoiceId || 'N/A',
                invoiceAmount: (applied.invoiceAmount || applied.invoice?.total || applied.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                paymentAmount: (applied.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                title: `Invoice: ${applied.invoiceNumber || applied.invoiceId || 'N/A'}`,
                description: `Invoice Amount: ${applied.invoiceAmount || 0}`,
                quantity: 1,
                rate: applied.amount || 0,
                amount: applied.amount || 0,
            })),
            subTotal: payment.amountReceived || 0,
            subtotal: payment.amountReceived || 0,
            total: payment.amountReceived || 0,
            remaining: payment.amountReceived || 0, // This shows in the "Total" box (mapped from Balance Due)
            previousRemaining: 0,
            currency: payment.currency || 'PKR',
            notes: (payment.bankCharges ?? 0) > 0 ? `Bank Charges: ${payment.bankCharges}` : ''
        };
    }, [payment]);

    // Handle template selection
    const handleTemplateSelect = async (template: any) => {
        if (!id) return;
        try {
            await updateTemplate(id, template.id);
            navigate(0); // Refresh page
        } catch (error) {
            console.error('Error updating template:', error);
        }
        setShowTemplateSelector(false);
    };

    // Handle send click
    const handleSendClick = () => {
        if (payment) {
            const targetId = id || payment.id;
            navigate(`/payments/${targetId}/email`, { state: { payment } });
        }
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById('pdf-print-area');
        if (!element) return;

        try {
            console.log('Starting PDF generation...');

            // Find all images and convert them to base64 using canvas
            const images = Array.from(element.querySelectorAll('img')) as HTMLImageElement[];
            const imageConversions: Array<{ img: HTMLImageElement; originalSrc: string; dataUrl: string }> = [];

            for (const img of images) {
                if (img.src && !img.src.startsWith('data:')) {
                    try {
                        console.log('Converting image:', img.src);

                        // Create a new image with CORS enabled to reload the image
                        const corsImage = new Image();
                        corsImage.crossOrigin = 'anonymous';

                        // Load the image with CORS
                        await new Promise<void>((resolve, reject) => {
                            corsImage.onload = () => resolve();
                            corsImage.onerror = () => {
                                console.warn('CORS load failed, trying without CORS');
                                // If CORS fails, try without it
                                const fallbackImage = new Image();
                                fallbackImage.onload = () => {
                                    // Use the fallback image
                                    Object.assign(corsImage, {
                                        width: fallbackImage.width,
                                        height: fallbackImage.height,
                                        naturalWidth: fallbackImage.naturalWidth,
                                        naturalHeight: fallbackImage.naturalHeight
                                    });
                                    // Copy the image data by drawing to canvas
                                    const tempCanvas = document.createElement('canvas');
                                    tempCanvas.width = fallbackImage.naturalWidth || fallbackImage.width;
                                    tempCanvas.height = fallbackImage.naturalHeight || fallbackImage.height;
                                    const tempCtx = tempCanvas.getContext('2d');
                                    if (tempCtx) {
                                        try {
                                            tempCtx.drawImage(fallbackImage, 0, 0);
                                            resolve();
                                        } catch (e) {
                                            reject(e);
                                        }
                                    } else {
                                        reject(new Error('Could not get canvas context'));
                                    }
                                };
                                fallbackImage.onerror = reject;
                                fallbackImage.src = img.src;
                            };
                            corsImage.src = img.src;
                        });

                        // Create a canvas to convert the image
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');

                        if (!ctx) continue;

                        // Set canvas size to image size
                        canvas.width = corsImage.naturalWidth || corsImage.width || img.naturalWidth || img.width;
                        canvas.height = corsImage.naturalHeight || corsImage.height || img.naturalHeight || img.height;

                        // Draw image to canvas
                        ctx.drawImage(corsImage, 0, 0);

                        // Convert to data URL
                        const dataUrl = canvas.toDataURL('image/png');

                        imageConversions.push({
                            img,
                            originalSrc: img.src,
                            dataUrl
                        });

                        console.log('Successfully converted image to data URL');
                    } catch (error) {
                        console.error('Failed to convert image:', img.src, error);
                    }
                }
            }

            // Replace all image sources with data URLs
            imageConversions.forEach(({ img, dataUrl }) => {
                img.src = dataUrl;
            });

            // Wait a bit for DOM to update
            await new Promise(resolve => setTimeout(resolve, 300));

            // Generate PDF
            const html2pdf = (await import('html2pdf.js')).default;
            const opt = {
                margin: 0,
                filename: `payment-${payment?.paymentNumber || 'receipt'}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    logging: false
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
            };

            await html2pdf().from(element).set(opt).save();

            // Restore original image sources
            imageConversions.forEach(({ img, originalSrc }) => {
                img.src = originalSrc;
            });

            console.log('PDF generation complete');
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    const handleEditWrapper = (id: string) => {
        handleEdit(id, payment);
    };

    return {
        id,
        payment,
        templates,

        templatesLoading,
        selectedTemplate,
        mappedInvoiceData,
        showTemplateSelector,
        setShowTemplateSelector,
        availableRecipients,
        selectedRecipients,
        handleRecipientToggle,
        handleTemplateSelect,
        handleSendClick,
        handleDownloadPDF,
        handleBackClick: handleBackToList,
        handleEdit: handleEditWrapper,
        activeTemplate: selectedTemplate,
    };
};

export default usePaymentPreview;
