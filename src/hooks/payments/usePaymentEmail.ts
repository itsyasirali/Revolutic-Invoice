import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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

export const usePaymentEmail = (paymentId: string, initialData?: any) => {
    const navigate = useNavigate();
    const { user } = useProfile();

    const [payment, setPayment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newEmailInput, setNewEmailInput] = useState('');
    const [activeField, setActiveField] = useState<'to' | 'cc' | 'bcc' | null>(null);


    const [emailData, setEmailData] = useState<EmailData>({
        from: '',
        to: [],
        cc: [],
        bcc: [],
        subject: '',
        message: '',
        attachPDF: true
    });

    const [availableEmails, setAvailableEmails] = useState<string[]>([]);

    const prepareEmailData = useCallback((paymentData: any) => {
        const userEmail = user?.email || 'your-email@company.com';
        const companyName = user?.companyName || 'Personal';

        const allCustomerEmails: string[] = [];

        // 1. Check top-level email field
        if (paymentData.customerEmail) {
            allCustomerEmails.push(paymentData.customerEmail);
        }

        // 2. Check customer object email
        if (paymentData.customer?.email && !allCustomerEmails.includes(paymentData.customer.email)) {
            allCustomerEmails.push(paymentData.customer.email);
        }

        // 3. Check customer object contacts
        if (paymentData.customer?.contacts) {
            paymentData.customer.contacts.forEach((contact: any) => {
                if (contact.email && !allCustomerEmails.includes(contact.email)) {
                    allCustomerEmails.push(contact.email);
                }
            });
        }

        setAvailableEmails(allCustomerEmails);

        const recipients = (allCustomerEmails.length > 0 ? [allCustomerEmails[0]] : []);

        const customerName = paymentData.customerDisplayName || paymentData.customer?.displayName || 'Customer';

        let formattedDate = 'N/A';
        try {
            formattedDate = paymentData.paymentDate ? new Date(paymentData.paymentDate).toLocaleDateString() : 'N/A';
        } catch {
            //
        }

        const amountReceived = paymentData.amountReceived ? Number(paymentData.amountReceived).toFixed(2) : '0.00';
        const currency = paymentData.currency || 'PKR';
        const paymentNumber = paymentData.paymentNumber || 'DRAFT';

        const defaultMessage = `Dear ${customerName},

Thank you for your payment. We have received it and processed it successfully.

Please find attached your payment receipt for your records.

PAYMENT DETAILS:
Receipt Number: ${paymentNumber}
Payment Date: ${formattedDate}
Amount Received: ${currency} ${amountReceived}

If you have any questions, please feel free to contact us.

Thank you for your business.

Best regards,
${user?.name || user?.firstName || 'Team'}
${companyName}`;

        setEmailData({
            from: userEmail,
            to: recipients,
            cc: [userEmail],
            bcc: [],
            subject: `Payment Receipt - ${paymentNumber} from ${companyName}`,
            message: defaultMessage,
            attachPDF: true
        });
    }, [user]);

    // Initialize data
    useEffect(() => {
        const initialize = async () => {
            let data = initialData;

            // If initial data is string (from params - though less likely in web), parse it
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (err) {
                    console.error("Failed to parse initial payment data", err);
                }
            }

            if (data) {
                setPayment(data);
                prepareEmailData(data);
                setLoading(false);
                return;
            }

            if (!paymentId || paymentId === 'preview' || paymentId === 'draft') {
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`/payments/${paymentId}`);
                data = response.data.payment || response.data;
                setPayment(data);
                prepareEmailData(data);
            } catch (error) {
                console.error('Error fetching payment:', error);
                setError('Failed to load payment data');
            } finally {
                setLoading(false);
            }
        };

        initialize();
    }, [paymentId, initialData, user, prepareEmailData]);

    const handleSend = async () => {
        if (emailData.to.length === 0) {
            alert('Please add at least one recipient');
            return;
        }

        setSending(true);
        try {
            const targetId = paymentId;

            if (!targetId || targetId === 'preview' || targetId === 'draft') {
                // Logic for saving draft first would go here if needed
                throw new Error("Cannot send draft payment directly from this hook yet");
            }

            await axios.post(`/payments/${targetId}/send`, {
                to: emailData.to,
                cc: emailData.cc,
                bcc: emailData.bcc,
                message: emailData.message,
                attachPDF: emailData.attachPDF,
            });

            alert('Payment receipt sent successfully');
            navigate('/payments'); // Go back to payments list
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

    const removeEmail = (type: 'to' | 'cc' | 'bcc', index: number) => {
        setEmailData(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== index) }));
    };

    const updateMessage = (text: string) => {
        setEmailData(prev => ({ ...prev, message: text }));
    };

    const toggleAttachPDF = () => {
        setEmailData(prev => ({ ...prev, attachPDF: !prev.attachPDF }));
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


    return {
        payment,
        loading,
        sending,
        error,
        emailData,
        availableEmails,
        handleSend,
        addEmail,
        removeEmail,
        updateMessage,
        toggleAttachPDF,
        newEmailInput,
        setNewEmailInput,
        activeField,
        setActiveField,
        handleAddEmail,
        handleKeyDown,
        navigate
    };
};
