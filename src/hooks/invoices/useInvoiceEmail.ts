import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../../Service/axios';
import { useProfile } from '../../hooks/auth/useProfile';

export interface EmailData {
    from: string;
    to: string[];
    cc: string[];
    bcc: string[];
    subject: string;
    message: string;
    attachPDF: boolean;
}

export const useInvoiceEmail = (invoiceId: string, initialData?: any) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useProfile();

    // Get invoice from location state if available
    const locationInvoice = useMemo(() => {
        if (location.state?.invoice) {
            return location.state.invoice;
        }
        return null;
    }, [location.state]);

    const [invoice, setInvoice] = useState<any>(locationInvoice || initialData);
    const [loading, setLoading] = useState(!invoice);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [newEmailInput, setNewEmailInput] = useState('');
    const [activeField, setActiveField] = useState<'to' | 'cc' | 'bcc' | null>(null);

    const [emailData, setEmailData] = useState<EmailData>({
        from: user?.email || '',
        to: [],
        cc: [],
        bcc: [],
        subject: '',
        message: '',
        attachPDF: true
    });

    const [availableEmails, setAvailableEmails] = useState<string[]>([]);

    const prepareEmailData = useCallback((invoiceData: any) => {
        const userEmail = user?.email || 'your-email@company.com';
        const companyName = user?.companyName || 'Personal';

        const allCustomerEmails: string[] = [];

        // 1. Check top-level email field
        if (invoiceData.customerEmail) {
            allCustomerEmails.push(invoiceData.customerEmail);
        }

        // 2. Check customer object email
        if (invoiceData.customerId?.email && !allCustomerEmails.includes(invoiceData.customerId.email)) {
            allCustomerEmails.push(invoiceData.customerId.email);
        }

        // 3. Check customer object contacts
        if (invoiceData.customerId?.contacts) {
            invoiceData.customerId.contacts.forEach((contact: any) => {
                if (contact.email && !allCustomerEmails.includes(contact.email)) {
                    allCustomerEmails.push(contact.email);
                }
            });
        }

        // 4. Fallback if just an ID or no deep structure
        if (allCustomerEmails.length === 0 && invoiceData.customer?.email) {
            allCustomerEmails.push(invoiceData.customer.email);
        }

        setAvailableEmails(allCustomerEmails);

        // Prioritize existing recipients on the invoice object (e.g. from Preview/List/DB)
        const recipients = (invoiceData.recipients && Array.isArray(invoiceData.recipients) && invoiceData.recipients.length > 0)
            ? invoiceData.recipients
            : (allCustomerEmails.length > 0 ? [allCustomerEmails[0]] : []);

        const currentInvoiceAmount = invoiceData.remaining !== undefined ? Number(invoiceData.remaining) : (Number(invoiceData.total) || 0);
        const previousRemaining = Number(invoiceData.previousRemaining) || 0;
        const totalBalanceDue = currentInvoiceAmount + previousRemaining;

        const customerName = invoiceData.customerDisplayName || invoiceData.customerName || invoiceData.customerId?.displayName || 'Customer';

        let formattedDate = 'N/A';
        try {
            formattedDate = invoiceData.invoiceDate ? new Date(invoiceData.invoiceDate).toLocaleDateString() : 'N/A';
        } catch {
            // Ignore parsing errors
        }

        let formattedDueDate = 'N/A';
        try {
            formattedDueDate = invoiceData.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString() : 'N/A';
        } catch {
            // Ignore parsing errors
        }

        const defaultMessage = `Dear ${customerName},

Thank you for choosing to work with us! We truly appreciate your trust and continued partnership.

Please find attached your invoice for the services/products provided. You can view, download, and print the invoice PDF from the attachment below.

INVOICE DETAILS:
Invoice Number: ${invoiceData.invoiceNumber}
Invoice Date: ${formattedDate}
Due Date: ${formattedDueDate}
Amount Due: ${invoiceData.currency || 'PKR'} ${totalBalanceDue.toFixed(2)}

If you have any questions or concerns regarding this invoice, please don't hesitate to reach out. We're here to help!

Thank you once again for your business. We look forward to serving you in the future.

Best regards,
${user?.name || user?.firstName || 'Team'}
${companyName}`;

        setEmailData({
            from: userEmail,
            to: recipients,
            cc: [userEmail],
            bcc: [],
            subject: `Invoice - ${invoiceData.invoiceNumber} from ${companyName}`,
            message: defaultMessage,
            attachPDF: true
        });
    }, [user, setEmailData]);

    // Initialize data
    useEffect(() => {
        const initialize = async () => {
            if (invoice) {
                prepareEmailData(invoice);
                return;
            }

            if (!invoiceId || invoiceId === 'preview' || invoiceId === 'draft') {
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`/invoices/${invoiceId}`);
                const data = response.data.invoice || response.data;
                setInvoice(data);
                prepareEmailData(data);
            } catch (error) {
                console.error('Error fetching invoice:', error);
                setError('Failed to load invoice data');
            } finally {
                setLoading(false);
            }
        };

        initialize();
    }, [invoiceId, user, invoice, prepareEmailData]);

    const handleSend = async () => {
        if (emailData.to.length === 0) {
            alert('Please add at least one recipient');
            return;
        }

        setSending(true);
        try {
            const targetId = invoiceId;

            if (!targetId || targetId === 'preview') {
                if (!invoice) throw new Error("No invoice data to save");
            }

            if (!targetId) throw new Error("Failed to process invoice ID");

            await axios.post(`/invoices/${targetId}/send`, {
                to: emailData.to,
                cc: emailData.cc,
                bcc: emailData.bcc,
                message: emailData.message,
                attachPDF: emailData.attachPDF,
                ...(targetId === 'draft' || targetId === 'preview' ? { invoiceData: invoice } : {})
            });

            alert('Invoice sent successfully');
            navigate('/invoices');
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to send email');
        } finally {
            setSending(false);
        }
    };

    const addEmail = (type: 'to' | 'cc' | 'bcc', email: string) => {
        const targetList = emailData[type];
        if (!targetList.includes(email)) {
            setEmailData(prev => ({ ...prev, [type]: [...prev[type], email] }));
        }
    };

    const handleAddEmail = (type: 'to' | 'cc' | 'bcc') => {
        if (newEmailInput.trim() && newEmailInput.includes('@')) {
            addEmail(type, newEmailInput.trim());
            setNewEmailInput('');
            setActiveField(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, type: 'to' | 'cc' | 'bcc') => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddEmail(type);
        }
    };

    const removeEmail = (type: 'to' | 'cc' | 'bcc', index: number) => {
        setEmailData(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== index) }));
    };

    const updateMessage = (text: string) => {
        setEmailData(prev => ({ ...prev, message: text }));
    };

    const toggleAttachPDF = () => {
        setEmailData(prev => ({ ...prev, attachPDF: !prev.attachPDF }));
    };

    return {
        invoice,
        loading,
        sending,
        error,
        emailData,
        availableEmails,
        newEmailInput,
        activeField,
        setNewEmailInput,
        setActiveField,
        handleSend,
        addEmail,
        handleAddEmail,
        handleKeyDown,
        removeEmail,
        updateMessage,
        toggleAttachPDF,
        navigate
    };
};
