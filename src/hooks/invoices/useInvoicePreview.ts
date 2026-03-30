import { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import type { TemplateListItem } from '../../types/template.d';
import useTemplatesList from '../templates/useTemplatesList';
import useUpdateInvoice from './useUpdateInvoice';

export const useInvoicePreview = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { templates, loading: templatesLoading } = useTemplatesList();
    const { updateInvoice } = useUpdateInvoice();

    const [showTemplateSelector, setShowTemplateSelector] = useState(false);
    const [localTemplate, setLocalTemplate] = useState<TemplateListItem | null>(null);

    // Get invoice from location state
    const invoice = useMemo(() => {
        // Priority 1: Check location state
        if (location.state?.invoice) {
            return location.state.invoice;
        }
        return null;
    }, [location.state]);

    const activeTemplate = useMemo(() => {
        // Priority 0: Explicitly selected local template
        if (localTemplate) return localTemplate;

        if (!invoice) return null;

        // Priority 1: Explicitly passed full template object in invoice.template
        // This avoids waiting for templates list to load if we already have the data
        if (invoice.template && typeof invoice.template === 'object' && (invoice.template.id || invoice.template.id)) {
            // Ensure it has at least some expected properties to be sure it's a full template
            if (invoice.template.templateName || invoice.template.name) {
                return invoice.template;
            }
        }

        if (templatesLoading) return null;

        // Try to find the ID from various possible locations
        let tId = invoice.templateId;

        // If templateId is an object (rare but possible in some setups) or if invoice.template object exists
        if (typeof tId === 'object' && tId !== null) {
            tId = tId.id || tId.id;
        } else if (!tId && invoice.template) {
            // Check the populated relation
            tId = invoice.template.id || invoice.template.id;
        }

        if (tId) {
            const found = templates.find(t => String(t.id) === String(tId));
            if (found) return found;
        }
        return templates.find(t => t.isDefault) || templates[0];
    }, [invoice, templates, templatesLoading, localTemplate]);

    const handleEdit = () => {
        if (invoice) {
            // If it's a draft, navigate to new or edit depending on if real ID exists
            const targetId = (id && id !== 'draft') ? id : (invoice.id || invoice.id);
            if (targetId) {
                navigate(`/invoices/edit/${targetId}`, { state: { invoice } });
            } else {
                navigate(`/invoices/new`, { state: { invoice } });
            }
        }
    };

    const handleSend = () => {
        if (invoice) {
            const resolvedTemplate = activeTemplate?.raw || activeTemplate;

            const invoiceToSend = {
                ...invoice,
                template: resolvedTemplate,
                templateId: resolvedTemplate?.id
            };

            const targetId = (id && id !== 'draft') ? id : 'draft';
            navigate(`/invoices/${targetId}/email`, { state: { invoice: invoiceToSend } });
        }
    };

    const handleTemplateSelect = async (template: TemplateListItem) => {
        setLocalTemplate(template);
        setShowTemplateSelector(false);

        // If we have a valid invoice ID, update it on the backend
        if (id && id !== 'draft') {
            try {
                // template from selector is likely a TemplateListItem, so it has .id as string
                // But updateInvoice might expect number. template.id should be convertible.
                await updateInvoice(id, { templateId: template.id });
            } catch (error) {
                console.error('Failed to update template:', error);
            }
        }
    };

    const handleBackClick = () => {
        navigate('/invoices');
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
                        // Continue with other images even if one fails
                    }
                }
            }

            console.log(`Converted ${imageConversions.length} images`);

            // Replace all image sources with data URLs
            imageConversions.forEach(({ img, dataUrl }) => {
                img.src = dataUrl;
            });

            // Wait a bit for DOM to update
            await new Promise(resolve => setTimeout(resolve, 300));

            // Generate PDF
            const html2pdf = await import('html2pdf.js');
            const opt = {
                margin: 0,
                filename: `invoice-${invoice?.invoiceNumber || 'draft'}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    logging: false
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
            };

            await html2pdf.default().from(element).set(opt).save();

            // Restore original image sources
            imageConversions.forEach(({ img, originalSrc }) => {
                img.src = originalSrc;
            });

            console.log('PDF generation complete');
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    const templateData = activeTemplate?.raw || activeTemplate;

    return {
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
    };
};
