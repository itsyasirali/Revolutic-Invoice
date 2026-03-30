import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import useCustomerData from '../customers/useCustomers';
import useItemsData from '../items/useItems';
import useCreateInvoice from './useCreateInvoice';
import useUpdateInvoice from './useUpdateInvoice';
import useInvoicesList from './useInvoicesData';
import useTemplatesList from '../templates/useTemplatesList';
import type {
    InvoiceItem,
    InvoiceFormData,
    InvoiceCustomer,
} from '../../types/invoice.d';
import type { Item } from '../../types/items.d';

export const useInvoiceForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const isEditMode = !!id;

    const { customers, loading: customersLoading } = useCustomerData();
    const { items: itemsData, loading: itemsLoading } = useItemsData();
    const { items: invoicesList } = useInvoicesList();
    const { templates } = useTemplatesList();
    const { saveDraft, loading: saving } = useCreateInvoice();
    const { updateInvoice, loading: updating } = useUpdateInvoice();
    // Removed unused handlePreview import from useInvoiceActions
    // Actually, looking at lines 532, handleSaveAndSend calls handlePreview with arguments.
    // The local handlePreview doesn't take arguments.
    // The previous code called `handlePreview` from `useInvoiceActions`.
    // I replaced handleSaveAndSend logic but kept the call to `handlePreview` inside it?
    // StartLine 532 calls handlePreview({...}). The local handlePreview takes no args.
    // So there is a conflict. 
    // The user wants 'Preview' button to trigger the local handlePreview (navigate with state).
    // The 'Save' flow also navigated to preview.
    // Let's remove handlePreview from useInvoiceActions and update the call inside handleSaveAndSend to use navigation directly or just let it use the local one if adapted?
    // The local handlePreview handles 'current form state'. 
    // The handleSaveAndSend calls it with 'saved payload + ID'.
    // I should probably remove the destructuring and fix any calls to matching signature.

    // Simplest fix: Remove handlePreview from import.
    // And check if handleSaveAndSend needs it.


    const [invoice, setInvoice] = useState<any | null>(null);
    const [formPopulated, setFormPopulated] = useState(false);


    const [items, setItems] = useState<InvoiceItem[]>([
        {
            id: 1,
            itemId: '',
            name: '',
            quantity: 1.0,
            unit: '',
            rate: 0.0,
            amount: 0.0,
        },
    ]);

    const [invoiceData, setInvoiceData] = useState<InvoiceFormData>({
        customerId: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        invoiceNumber: 'INV-0000001',
        invoiceDate: new Date().toISOString().split('T')[0],
        terms: 'Due on Receipt',
        dueDate: new Date().toISOString().split('T')[0],
        notes: '',
        currency: 'PKR',
        recipients: [],
        discountPercent: 0,
        templateId: '',
    });

    const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [itemDropdownOpen, setItemDropdownOpen] = useState<{ [key: number]: boolean }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [customerInvoices, setCustomerInvoices] = useState<unknown[]>([]);

    const customerDropdownRef = useRef<HTMLDivElement>(null);
    const itemDropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

    const selectedCustomer = customers.find((c) => String(c.id || c.id) === String(invoiceData.customerId));

    const lastProcessedCustomerId = useRef<string>('');

    // Load customer invoices when customer changes and set template
    useEffect(() => {
        const customerIdStr = String(invoiceData.customerId || '');

        if (invoiceData.customerId) {
            const filtered = invoicesList.filter((inv: any) => {
                const raw = inv?.raw || inv;
                const cid = String(raw?.customerId || raw?.customer?.id || raw?.customer?.id || '');
                return cid === customerIdStr;
            });

            // Sort by createdAt descending (assuming higher ID or createdAt)
            const sorted = filtered.sort((a: any, b: any) => {
                const dateA = new Date(a.raw?.createdAt || a.createdAt || 0).getTime();
                const dateB = new Date(b.raw?.createdAt || b.createdAt || 0).getTime();
                return dateB - dateA;
            });

            setCustomerInvoices(sorted);

            // Set Template: Last used or Default
            // Only auto-set on new invoices AND (if customer changed OR no template set yet)
            const shouldAutoSelectTemplate = !isEditMode && (customerIdStr !== lastProcessedCustomerId.current || !invoiceData.templateId);

            if (shouldAutoSelectTemplate) {
                let targetTemplateId = '';
                if (sorted.length > 0) {
                    const lastInvoice = sorted[0].raw || sorted[0];
                    if (lastInvoice.templateId) {
                        targetTemplateId = typeof lastInvoice.templateId === 'object' ? (lastInvoice.templateId.id || lastInvoice.templateId.id) : lastInvoice.templateId;
                    }
                }

                if (!targetTemplateId && templates.length > 0) {
                    // Find default or first
                    const defaultTemplate = templates.find((t: any) => t.isDefault) || templates[0];
                    targetTemplateId = defaultTemplate.id;
                }

                if (targetTemplateId) {
                    setInvoiceData(prev => ({ ...prev, templateId: targetTemplateId }));
                }
            }
        } else {
            setCustomerInvoices([]);
            // Apply default template if no customer selected yet and no template set
            if (!isEditMode && !invoiceData.templateId && templates.length > 0) {
                const defaultTemplate = templates.find((t: any) => t.isDefault) || templates[0];
                const targetTemplateId = defaultTemplate.id;
                if (targetTemplateId) {
                    setInvoiceData(prev => ({ ...prev, templateId: targetTemplateId }));
                }
            }
        }

        lastProcessedCustomerId.current = customerIdStr;
    }, [invoiceData.customerId, invoicesList, templates, isEditMode, invoiceData.templateId]);

    const namePopulatedRef = useRef(false);

    // Sync customer name if resolved later (after customers load)
    useEffect(() => {
        if (isEditMode && !namePopulatedRef.current && invoiceData.customerId && !customersLoading && customers.length > 0) {
            const found = customers.find((c) => String(c.id || c.id) === String(invoiceData.customerId));
            if (found) {
                const name = found.displayName || found.companyName || '';
                if (name) {
                    setCustomerSearchTerm(name);
                    namePopulatedRef.current = true;
                }
            }
        }
    }, [customers, customersLoading, isEditMode, invoiceData.customerId]);

    // Load invoice data for edit mode
    useEffect(() => {
        if (isEditMode && id) {
            setFormPopulated(false);
            namePopulatedRef.current = false;

            // Priority 1: Check location state (from navigation)
            if (location.state?.invoice) {
                setInvoice(location.state.invoice);
                return;
            }



            // Priority 3: Find in invoice list (last resort)
            const foundInvoice = invoicesList.find((inv) => inv.id === Number(id));
            if (foundInvoice && foundInvoice.raw) {
                setInvoice(foundInvoice.raw);
            }
        } else {
            setInvoice(null);
            setFormPopulated(false);
        }
    }, [id, isEditMode, location.state, invoicesList]);

    // Populate form when invoice is loaded for editing
    useEffect(() => {
        if (invoice && isEditMode && !formPopulated) {
            const formatDate = (date: string | Date | undefined): string => {
                if (!date) return '';
                const d = new Date(date);
                if (isNaN(d.getTime())) return '';
                return d.toISOString().split('T')[0];
            };

            const invoiceDateStr = invoice.invoiceDate;
            const dueDateStr = invoice.dueDate;
            if (!invoiceDateStr || !dueDateStr) {
                return;
            }
            const invoiceDate = new Date(invoiceDateStr);
            const dueDate = new Date(dueDateStr);
            if (isNaN(invoiceDate.getTime()) || isNaN(dueDate.getTime())) {
                return;
            }
            const daysDiff = Math.floor((dueDate.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
            let terms = 'Due on Receipt';
            if (daysDiff === 15) terms = 'Net 15';
            else if (daysDiff === 30) terms = 'Net 30';
            else if (daysDiff === 60) terms = 'Net 60';

            const customerIdValue = typeof invoice.customerId === 'object' && invoice.customerId !== null
                ? String(invoice.customerId.id || invoice.customerId.id)
                : String(invoice.customerId || '');

            setInvoiceData({
                customerId: customerIdValue,

                customerName: invoice.customerDisplayName || (typeof invoice.customerId === 'object' ? (invoice.customerId.displayName || invoice.customerId.companyName) : '') || '',
                customerEmail: invoice.customerEmail || '',
                customerPhone: invoice.customerPhone || '',
                customerAddress: invoice.customerAddress || '',
                invoiceNumber: invoice.invoiceNumber || '',
                invoiceDate: formatDate(invoiceDateStr),
                terms: terms,
                dueDate: formatDate(dueDateStr),
                notes: typeof invoice.notes === 'string' ? invoice.notes : '',
                currency: invoice.currency || 'PKR',
                recipients: invoice.recipients || [],
                discountPercent: invoice.discountPercent || 0,
                templateId: (invoice.templateId && typeof invoice.templateId === 'object') ? (invoice.templateId.id || invoice.templateId.id) : invoice.templateId || '',
            });

            const customerNameDisplay = invoice.customerDisplayName ||
                (typeof invoice.customerId === 'object' ? (invoice.customerId.displayName || invoice.customerId.companyName) : '') ||
                '';
            setCustomerSearchTerm(customerNameDisplay);
            if (customerNameDisplay) {
                namePopulatedRef.current = true;
            }

            if (invoice.items && Array.isArray(invoice.items) && invoice.items.length > 0) {
                const mappedItems: InvoiceItem[] = invoice.items.map((item: any, index: number) => {
                    let unit = '';
                    // Handle itemId being either a string or a populated object
                    const rawItemId = item.itemId;
                    const itemIdStr = (typeof rawItemId === 'object' && rawItemId !== null)
                        ? String(rawItemId.id || rawItemId.id)
                        : String(rawItemId || '');

                    if (itemIdStr) {
                        const foundItem = itemsData.find((it) => String(it.id) === itemIdStr);
                        unit = foundItem?.unit || '';
                    } else if (typeof rawItemId === 'object' && rawItemId.unit) {
                        // Fallback: If no match in itemsData yet (loading?), try populated unit
                        unit = rawItemId.unit;
                    }

                    // If unit is still empty, check if it was saved directly on the invoice item line
                    if (!unit && item.unit) {
                        unit = item.unit;
                    }

                    return {
                        id: index + 1,
                        itemId: itemIdStr,
                        name: item.title || item.name || (typeof rawItemId === 'object' ? rawItemId.name : '') || '',
                        quantity: Number(item.quantity) || 1,
                        unit: unit,
                        rate: Number(item.rate) || 0,
                        amount: Number(item.amount) || 0,
                    };
                });
                setItems(mappedItems);
            }
            setFormPopulated(true);
        }
    }, [invoice, isEditMode, formPopulated, itemsData]);

    // Handle click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
                setCustomerDropdownOpen(false);
            }
            Object.keys(itemDropdownRefs.current).forEach((key) => {
                const ref = itemDropdownRefs.current[Number(key)];
                if (ref && !ref.contains(event.target as Node)) {
                    setItemDropdownOpen((prev) => ({ ...prev, [Number(key)]: false }));
                }
            });
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Calculations
    const calculateAmount = (quantity: number, rate: number): number => {
        return quantity * rate;
    };

    const calculateSubtotal = (): number => {
        return items.reduce((sum, item) => sum + item.amount, 0);
    };

    const calculateTotal = (): number => {
        const subTotal = items.reduce((sum, item) => sum + item.amount, 0);
        const discountPercent = Number(invoiceData.discountPercent) || 0;
        const discountAmount = (subTotal * discountPercent) / 100;
        return subTotal - discountAmount;
    };

    const calculateDueDate = (terms: string, invoiceDate: string): string => {
        const date = new Date(invoiceDate);
        if (terms === 'Due on Receipt') {
            return invoiceDate;
        } else if (terms === 'Net 15') {
            date.setDate(date.getDate() + 15);
        } else if (terms === 'Net 30') {
            date.setDate(date.getDate() + 30);
        } else if (terms === 'Net 60') {
            date.setDate(date.getDate() + 60);
        }
        return date.toISOString().split('T')[0];
    };

    // Customer operations
    const selectCustomer = (customer: InvoiceCustomer) => {
        setInvoiceData((prev) => ({
            ...prev,
            customerId: String(customer.id),
            customerName: customer.displayName || customer.companyName || '',
            customerEmail: customer.contacts?.[0]?.email || '',
            customerPhone: customer.contacts?.[0]?.contact || '',
            customerAddress: customer.address || '',
            currency: customer.currency || prev.currency || 'PKR',
            recipients: [],
        }));
        setCustomerSearchTerm(customer.displayName || customer.companyName || '');
        setCustomerDropdownOpen(false);
    };

    // Item operations
    const selectItem = (itemId: number, item: Item) => {
        setItems((prevItems) =>
            prevItems.map((invItem) => {
                if (invItem.id === itemId) {
                    return {
                        ...invItem,
                        itemId: String(item.id),
                        name: item.name || '',
                        unit: item.unit || '',
                        rate: item.sellingPrice || 0,
                        amount: calculateAmount(invItem.quantity, item.sellingPrice || 0),
                    };
                }
                return invItem;
            })
        );
        setItemDropdownOpen((prev) => ({ ...prev, [itemId]: false }));
    };

    const updateItem = (id: number, field: keyof InvoiceItem, value: string | number): void => {
        setItems((prevItems) =>
            prevItems.map((item) => {
                if (item.id === id) {
                    const updatedItem: InvoiceItem = { ...item, [field]: value } as InvoiceItem;
                    if (field === 'quantity' || field === 'rate') {
                        updatedItem.amount = calculateAmount(updatedItem.quantity, updatedItem.rate);
                    }
                    return updatedItem;
                }
                return item;
            })
        );
    };

    const addNewRow = (): void => {
        setItems((prev) => [
            ...prev,
            {
                id: prev.length > 0 ? Math.max(...prev.map((i) => i.id)) + 1 : 1,
                itemId: '',
                name: '',
                quantity: 1.0,
                unit: '',
                rate: 0.0,
                amount: 0.0,
            },
        ]);
    };

    const deleteItem = (id: number): void => {
        if (items.length > 1) {
            setItems(items.filter((item) => item.id !== id));
        }
    };

    // Form data operations
    const handleInvoiceChange = (field: keyof InvoiceFormData, value: string | string[]): void => {
        setInvoiceData((prev) => {
            const updated = { ...prev, [field]: value };
            if (field === 'invoiceDate') {
                updated.dueDate = calculateDueDate(prev.terms, value as string);
            }
            return updated;
        });
    };

    const handleTermsChange = (terms: string) => {
        setInvoiceData((prev) => ({
            ...prev,
            terms,
            dueDate: calculateDueDate(terms, prev.invoiceDate),
        }));
    };

    // Save operations
    const handleSaveDraft = async () => {
        const payload = {
            invoiceNumber: invoiceData.invoiceNumber,
            invoiceDate: invoiceData.invoiceDate,
            dueDate: invoiceData.dueDate,
            customerId: invoiceData.customerId,
            customerDisplayName: invoiceData.customerName,
            customerEmail: invoiceData.customerEmail,
            customerPhone: invoiceData.customerPhone,
            customerAddress: invoiceData.customerAddress,
            currency: invoiceData.currency,
            items: items.map((item) => ({
                itemId: item.itemId,
                title: item.name,
                description: '',
                quantity: item.quantity,
                rate: item.rate,
                amount: item.amount,
            })),
            subTotal: calculateSubtotal(),
            taxPercent: 0,
            discountPercent: Number(invoiceData.discountPercent) || 0,
            shipping: 0,
            total: calculateTotal(),
            templateId: invoiceData.templateId,
            notes: invoiceData.notes,
            recipients: invoiceData.recipients,
            previousRemaining: (() => {
                if (isEditMode && invoice && String(invoice.customerId?.id || invoice.customerId?.id || invoice.customerId) === String(invoiceData.customerId)) {
                    return invoice.previousRemaining || 0;
                }
                return selectedCustomer?.receivables || 0;
            })(),
        };

        if (isEditMode && id) {
            const result = await updateInvoice(id, payload);
            if (result) {
                navigate('/invoices');
            }
        } else {
            const result = await saveDraft(payload);
            if (result) {
                navigate('/invoices');
            }
        }
    };

    const handlePreview = () => {
        const payload = {
            invoiceNumber: invoiceData.invoiceNumber,
            invoiceDate: invoiceData.invoiceDate,
            dueDate: invoiceData.dueDate,
            customerId: invoiceData.customerId,
            customerDisplayName: invoiceData.customerName,
            customerEmail: invoiceData.customerEmail,
            customerPhone: invoiceData.customerPhone,
            customerAddress: invoiceData.customerAddress,
            currency: invoiceData.currency,
            items: items.map((item) => ({
                itemId: item.itemId,
                title: item.name,
                description: '',
                quantity: item.quantity,
                rate: item.rate,
                amount: item.amount,
            })),
            subTotal: calculateSubtotal(),
            taxPercent: 0,
            discountPercent: Number(invoiceData.discountPercent) || 0,
            shipping: 0,
            total: calculateTotal(),
            // Find selected template object to pass directly to preview
            // This ensures InvoicePreview doesn't need to wait for 'useTemplatesList'
            template: templates.find(t => String(t.id) === String(invoiceData.templateId))?.raw || templates.find(t => String(t.id) === String(invoiceData.templateId)) || undefined,
            templateId: invoiceData.templateId,
            notes: invoiceData.notes,
            recipients: selectedCustomer?.contacts?.map(contact => contact.email || '').filter(email => !!email) || [],
            previousRemaining: (() => {
                if (isEditMode && invoice && String(invoice.customerId?.id || invoice.customerId?.id || invoice.customerId) === String(invoiceData.customerId)) {
                    return invoice.previousRemaining || 0;
                }
                return selectedCustomer?.receivables || 0;
            })(),
            status: isEditMode && invoice ? invoice.status : 'Draft',
        };

        // Use 'draft' as ID for unsaved preview, or actual ID if editing
        const previewId = isEditMode && id ? id : 'draft';
        navigate(`/invoices/preview/${previewId}`, { state: { invoice: payload } });
    };

    const handleSaveAndSend = async () => {
        if (isSubmitting || saving || updating) {
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                invoiceNumber: invoiceData.invoiceNumber,
                invoiceDate: invoiceData.invoiceDate,
                dueDate: invoiceData.dueDate,
                customerId: invoiceData.customerId,
                customerDisplayName: invoiceData.customerName,
                customerEmail: invoiceData.customerEmail,
                customerPhone: invoiceData.customerPhone,
                customerAddress: invoiceData.customerAddress,
                currency: invoiceData.currency,
                items: items.map((item) => ({
                    itemId: item.itemId,
                    title: item.name,
                    description: '',
                    quantity: item.quantity,
                    rate: item.rate,
                    amount: item.amount,
                })),
                subTotal: calculateSubtotal(),
                taxPercent: 0,
                discountPercent: Number(invoiceData.discountPercent) || 0,
                shipping: 0,
                total: calculateTotal(),
                templateId: invoiceData.templateId,
                notes: invoiceData.notes,
                recipients: selectedCustomer?.contacts?.map(contact => contact.email || '').filter(email => !!email) || [],
                previousRemaining: (() => {
                    if (isEditMode && invoice && String(invoice.customerId?.id || invoice.customerId?.id || invoice.customerId) === String(invoiceData.customerId)) {
                        return invoice.previousRemaining || 0;
                    }
                    return selectedCustomer?.receivables || 0;
                })(),
            };

            let invoiceId = id;

            // Save invoice as draft first
            if (isEditMode && id) {
                const result = await updateInvoice(id, payload);
                if (!result) {
                    setIsSubmitting(false);
                    return;
                }
                invoiceId = id;
            } else {
                const result = await saveDraft(payload);
                if (!result || !result.id) {
                    setIsSubmitting(false);
                    return;
                }
                invoiceId = result.id;
            }

            // Navigate to preview screen with invoice data
            if (invoiceId) {
                // Determine if we should preserve status and payment info
                const currentStatus = invoice?.status;
                const preserveStatus = isEditMode && invoice && ['Sent', 'Partially Paid', 'Paid'].includes(currentStatus);

                const finalStatus = preserveStatus ? currentStatus : 'Draft';
                const finalReceived = preserveStatus ? (invoice.received || 0) : 0;
                const finalRemaining = calculateTotal() - finalReceived;

                // Navigate manually instead of calling handlePreview which now has a different signature/scope
                navigate(`/invoices/preview/${invoiceId}`, {
                    state: {
                        invoice: {
                            ...payload,
                            id: invoiceId,
                            items: items,
                            subTotal: calculateSubtotal(),
                            total: calculateTotal(),
                            received: finalReceived,
                            remaining: finalRemaining,
                            previousRemaining: (() => {
                                if (isEditMode && invoice && String(invoice.customerId?.id || invoice.customerId?.id || invoice.customerId) === String(invoiceData.customerId)) {
                                    return invoice.previousRemaining || 0;
                                }
                                return selectedCustomer?.receivables || 0;
                            })(),
                            status: finalStatus,
                            discountPercent: Number(invoiceData.discountPercent) || 0,
                            templateId: invoiceData.templateId,
                            // Pass full template object to avoid loading wait in Preview
                            template: templates.find(t => String(t.id) === String(invoiceData.templateId))?.raw || templates.find(t => String(t.id) === String(invoiceData.templateId)) || undefined,
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error in handleSaveAndSend:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/invoices');
    };

    // Filtered data
    const filteredCustomers = customers.filter((customer) => {
        const searchLower = customerSearchTerm.toLowerCase();
        const displayName = (customer.displayName || customer.companyName || '').toLowerCase();
        const email = (customer.contacts?.[0]?.email || '').toLowerCase();
        return displayName.includes(searchLower) || email.includes(searchLower);
    });

    return {
        // State
        isEditMode,
        items,
        invoiceData,
        invoice,
        customerDropdownOpen,
        customerSearchTerm,
        itemDropdownOpen,
        isSubmitting,
        customerInvoices,
        selectedCustomer,
        filteredCustomers,

        // Refs
        customerDropdownRef,
        itemDropdownRefs,

        // Loading states
        customersLoading,
        itemsLoading,
        saving,
        updating,

        // Data
        customers,
        itemsData,

        // Setters
        setCustomerDropdownOpen,
        setCustomerSearchTerm,
        setItemDropdownOpen,

        // Operations
        selectCustomer,
        selectItem,
        updateItem,
        addNewRow,
        deleteItem,
        handleInvoiceChange,
        handleTermsChange,
        handleSaveDraft,
        handleSaveAndSend,
        handlePreview,
        handleCancel,

        // Calculations
        calculateTotal,
        calculateSubtotal,
    };
};

export default useInvoiceForm;
