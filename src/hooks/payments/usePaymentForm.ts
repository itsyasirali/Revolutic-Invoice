import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from '../../Service/axios';
import useCustomers from '../customers/useCustomers';
import usePaymentActions from './usePaymentActions';
import type { PaymentFormData, UsePaymentFormReturn } from '../../types/Payment.d';

export const usePaymentForm = (): UsePaymentFormReturn => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isEditMode = Boolean(id);

    const { customers, loading: customersLoading } = useCustomers();
    const { handlePreview } = usePaymentActions();

    const [paymentData, setPaymentData] = useState<PaymentFormData>({
        customerId: '',
        customerName: '',
        customerEmail: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMode: 'Cash',
        referenceNo: '',
        amountReceived: '',
        bankCharges: '',
        currency: 'PKR',
    });

    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
    const [selectedCustomerData, setSelectedCustomerData] = useState<any>(null);
    const [unpaidInvoices, setUnpaidInvoices] = useState<any[]>([]);
    const [appliedAmounts, setAppliedAmounts] = useState<Record<string, number>>({});
    const [payAllRemaining, setPayAllRemaining] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Load payment data from location state or localStorage if in edit mode
    useEffect(() => {
        const statePayment = location.state?.payment;
        const storedPayment = localStorage.getItem('selectedPayment');

        let paymentSource = null;
        if (statePayment) {
            paymentSource = statePayment;
        } else if (storedPayment && id) {
            try {
                paymentSource = JSON.parse(storedPayment);
            } catch (e) {
                console.error('Error parsing payment data:', e);
            }
        }

        if (paymentSource) {
            setPaymentData({
                customerId: paymentSource.customerId || paymentSource.customer?.id || paymentSource.customer?.id || '',
                customerName: paymentSource.customerDisplayName || paymentSource.customer?.displayName || paymentSource.customer?.companyName || '',
                customerEmail: paymentSource.customerEmail || paymentSource.customer?.email || '',
                paymentDate: paymentSource.paymentDate ? new Date(paymentSource.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                paymentMode: paymentSource.paymentMode || 'Cash',
                referenceNo: paymentSource.referenceNo || '',
                amountReceived: paymentSource.amountReceived || '',
                bankCharges: paymentSource.bankCharges || '',
                currency: paymentSource.currency || 'PKR',
            });

            // If we have the full customer object, select it to trigger invoice loading
            if (paymentSource.customer) {
                // We need to ensure the customer selection logic runs to load invoices
                // But we can't call selectCustomer directly inside useEffect easily without causing loops or missing dependencies
                // So we set the selected structure which triggers the other effect
                // However, the other effect depends on `paymentData.customerId` which we just set.
                // We might need to manually set selectedCustomerData if available
                setSelectedCustomerData(paymentSource.customer);
                setCustomerSearchTerm(paymentSource.customerDisplayName || paymentSource.customer?.displayName || paymentSource.customer?.companyName || '');
            }
        }
    }, [id, location.state]);

    // Fetch unpaid invoices when customer selected
    useEffect(() => {
        if (!paymentData.customerId) {
            setUnpaidInvoices([]);
            return;
        }

        const fetchUnpaidInvoices = async () => {
            try {
                const response = await axios.get(`/invoices?customerId=${paymentData.customerId}`);
                const invoices = response.data.invoices || response.data || [];

                console.log('Fetched invoices for payment:', invoices);

                const eligible = invoices.filter((inv: any) => {
                    const status = (inv.status || '').toLowerCase();
                    const remaining = Number(inv.remaining || 0);

                    // Allow statuses that imply the invoice is finalized and actionable
                    const validStatus = ['sent', 'partially paid', 'overdue', 'viewed', 'paid'].includes(status);

                    // Even if status is 'paid', if remaining > 0 (data inconsistency?), we might want to show it, 
                    // but typically 'paid' means remaining 0. 
                    // For safety, strict check on remaining > 0 is key.
                    // We exclude 'draft' and 'void' typically.

                    return validStatus && remaining > 0;
                }).map((inv: any) => ({
                    ...inv,
                    remaining: Number(inv.remaining || 0),
                    total: Number(inv.total || 0),
                    amount: Number(inv.amount || 0)
                }));
                setUnpaidInvoices(eligible);
            } catch (error) {
                console.error('Error fetching unpaid invoices:', error);
                setUnpaidInvoices([]);
            }
        };

        fetchUnpaidInvoices();
    }, [paymentData.customerId]);

    const selectCustomer = (customer: any) => {
        const cId = customer.id || customer.id;
        console.log('Selected customer:', customer, 'ID used:', cId);

        setPaymentData((prev) => ({
            ...prev,
            customerId: cId,
            customerName: customer.displayName || customer.companyName || '',
            customerEmail: customer.contacts?.[0]?.email || customer.email || '',
            currency: customer.currency || prev.currency || 'PKR',
        }));
        setSelectedCustomerData(customer);
        setCustomerSearchTerm(customer.displayName || customer.companyName || '');
        setCustomerDropdownOpen(false);
        setAppliedAmounts({});
        setPayAllRemaining(false);
    };

    const handlePayAllRemainingToggle = () => {
        setPayAllRemaining((prev) => {
            const newValue = !prev;
            if (newValue) {
                const totalRemaining = unpaidInvoices.reduce((sum, inv) => sum + (inv.remaining || 0), 0);
                setPaymentData((prev) => ({ ...prev, amountReceived: totalRemaining }));

                const newAppliedAmounts: Record<string, number> = {};
                unpaidInvoices.forEach((inv) => {
                    newAppliedAmounts[inv.id || inv.id] = inv.remaining || 0;
                });
                setAppliedAmounts(newAppliedAmounts);
            } else {
                setPaymentData((prev) => ({ ...prev, amountReceived: '' }));
                setAppliedAmounts({});
            }
            return newValue;
        });
    };

    const handleAppliedAmountChange = (invoiceId: string, value: string) => {
        const numValue = value === '' ? 0 : Number(value);
        setAppliedAmounts((prev) => ({
            ...prev,
            [invoiceId]: numValue,
        }));
    };

    const handlePayInFull = (invoiceId: string, remaining: number) => {
        setAppliedAmounts((prev) => ({
            ...prev,
            [invoiceId]: remaining,
        }));
    };

    const totalApplied = Object.values(appliedAmounts).reduce((sum, amount) => sum + amount, 0);
    const amountInExcess = Math.max((typeof paymentData.amountReceived === 'number' ? paymentData.amountReceived : 0) - totalApplied, 0);

    const filteredCustomers = customers.filter((customer) => {
        const searchLower = customerSearchTerm.toLowerCase();
        const displayName = (customer.displayName || customer.companyName || '').toLowerCase();
        const email = (customer.contacts?.[0]?.email || '').toLowerCase();
        const companyName = (customer.companyName || '').toLowerCase();
        return displayName.includes(searchLower) || email.includes(searchLower) || companyName.includes(searchLower);
    });

    const handleSaveDraft = async () => {
        if (isSaving || isSubmitting) return;

        setIsSaving(true);
        try {
            const appliedInvoicesPayload = Object.entries(appliedAmounts)
                .filter(([, amount]) => amount > 0)
                .map(([invoiceId, amount]) => ({
                    invoiceId,
                    amount: Number(amount),
                }));

            const payload = {
                paymentDate: paymentData.paymentDate,
                referenceNo: paymentData.referenceNo || undefined,
                customerId: paymentData.customerId,
                customerDisplayName: paymentData.customerName,
                customerEmail: paymentData.customerEmail,
                paymentMode: paymentData.paymentMode,
                amountReceived: typeof paymentData.amountReceived === 'number' ? paymentData.amountReceived : 0,
                bankCharges: typeof paymentData.bankCharges === 'number' ? paymentData.bankCharges : 0,
                currency: paymentData.currency,
                status: 'Draft' as const,
                appliedInvoices: appliedInvoicesPayload.length > 0 ? appliedInvoicesPayload : undefined,
            };

            if (isEditMode && id) {
                await axios.put(`/payments/${id}`, payload);
                localStorage.removeItem('selectedPayment');
                navigate('/payments');
            } else {
                const response = await axios.post(`/payments`, payload);
                if (response.data) {
                    navigate('/payments');
                }
            }
        } catch (error) {
            console.error('Error saving draft:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAndSend = async () => {
        if (isSubmitting || isSaving) return;

        setIsSubmitting(true);
        try {
            const appliedInvoicesPayload = Object.entries(appliedAmounts)
                .filter(([, amount]) => amount > 0)
                .map(([invoiceId, amount]) => {
                    const invoice = unpaidInvoices.find(inv => (inv.id === invoiceId || inv.id === invoiceId || String(inv.id) === String(invoiceId)));
                    return {
                        invoiceId,
                        amount: Number(amount),
                        invoiceNumber: invoice?.invoiceNumber,
                        invoiceAmount: invoice?.total,
                    };
                });

            const payload = {
                paymentDate: paymentData.paymentDate,
                referenceNo: paymentData.referenceNo || undefined,
                customerId: paymentData.customerId,
                customerDisplayName: paymentData.customerName,
                customerEmail: paymentData.customerEmail,
                paymentMode: paymentData.paymentMode,
                amountReceived: typeof paymentData.amountReceived === 'number' ? paymentData.amountReceived : 0,
                bankCharges: typeof paymentData.bankCharges === 'number' ? paymentData.bankCharges : 0,
                currency: paymentData.currency,
                status: 'Paid' as const,
                appliedInvoices: appliedInvoicesPayload.length > 0 ? appliedInvoicesPayload : undefined,
            };

            let paymentId = id;

            if (isEditMode && id) {
                await axios.put(`/payments/${id}`, payload);
                localStorage.removeItem('selectedPayment');
            } else {
                const response = await axios.post(`/payments`, payload);
                console.log('Create Payment Response:', response.data);
                paymentId = response.data.id || response.data.id || response.data.payment?.id || response.data.payment?.id;
                console.log('Extracted Payment ID:', paymentId);
            }

            if (paymentId) {
                // Pass the complete payload including invoice details to preview
                handlePreview(paymentId, {
                    ...payload,
                    id: paymentId,
                    appliedInvoices: appliedInvoicesPayload,
                });
            }
        } catch (error) {
            console.error('Error in handleSaveAndSend:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = Boolean(
        paymentData.customerId &&
        (typeof paymentData.amountReceived === 'number' && paymentData.amountReceived > 0) &&
        paymentData.paymentDate
    );

    const paymentModeOptions = [
        { value: 'Cash', label: 'Cash' },
        { value: 'Bank Transfer', label: 'Bank Transfer' },
        { value: 'Bank Remittance', label: 'Bank Remittance' },
        { value: 'Cheque', label: 'Cheque' },
    ];


    return {
        isEditMode,
        paymentData,
        setPaymentData,
        customerSearchTerm,
        setCustomerSearchTerm,
        customerDropdownOpen,
        setCustomerDropdownOpen,
        selectedCustomerData,
        setSelectedCustomerData,
        unpaidInvoices,
        setUnpaidInvoices,
        appliedAmounts,
        setAppliedAmounts,
        payAllRemaining,
        setPayAllRemaining,
        isSubmitting,
        isSaving,
        filteredCustomers,
        totalApplied,
        amountInExcess,
        selectCustomer,
        handlePayAllRemainingToggle,
        handleAppliedAmountChange,
        handlePayInFull,
        handleSaveDraft,
        handleSaveAndSend,
        customersLoading,
        isFormValid,
        paymentModeOptions,
    };
};

export default usePaymentForm;
