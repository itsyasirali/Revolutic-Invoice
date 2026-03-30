import React from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';

// Hooks
import usePaymentForm from '../../hooks/payments/usePaymentForm';
import PageHeader from '../common/PageHeader';
import { Search, Mail } from 'lucide-react';

const PaymentForm: React.FC = () => {
  const navigate = useNavigate();
  const {
    paymentData,
    setPaymentData,
    customerSearchTerm,
    setCustomerSearchTerm,
    customerDropdownOpen,
    setCustomerDropdownOpen,
    selectedCustomerData,
    unpaidInvoices,
    appliedAmounts,
    payAllRemaining,
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
  } = usePaymentForm();




  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PageHeader
        title="Record Payment"
        showBackButton={true}
        onBack={() => navigate('/payments')}
      />

      <div className="flex-1 py-8 px-8 w-full">
        <div className="flex flex-col gap-y-8">
          {/* Customer Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                Customer Details
              </label>
              <div className="relative">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Customer Name
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)}
                    className="w-full px-4 py-3 text-left text-sm border border-gray-200 rounded-xl bg-white text-gray-900 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <span>{paymentData.customerName || "Select Customer"}</span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>


                  {customerDropdownOpen && (
                    <div className="absolute z-50 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="sticky top-0 bg-gray-50/80 backdrop-blur-md border-b border-gray-100 p-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Search customers..."
                            value={customerSearchTerm}
                            onChange={(e) => setCustomerSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-gray-900 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none"
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="max-h-64 overflow-y-auto">
                        {customersLoading ? (
                          <div className="px-4 py-3 text-sm text-gray-700">Loading customers...</div>
                        ) : filteredCustomers.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-700">No customers found</div>
                        ) : (
                          filteredCustomers.map((customer) => {
                            const initial = (customer.displayName || customer.companyName || '?').charAt(0).toUpperCase();
                            return (
                              <button
                                key={customer.id || customer.id}
                                onClick={() => selectCustomer(customer)}
                                className="w-full text-left px-4 py-3 hover:bg-blue-500 hover:text-white transition-colors border-b border-gray-100 last:border-b-0 group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 group-hover:bg-white flex items-center justify-center">
                                    <span className="text-blue-600 group-hover:text-blue-500 font-bold text-sm">
                                      {initial}
                                    </span>
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm text-gray-900 group-hover:text-white truncate">
                                      {customer.displayName || customer.companyName}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      {customer.contacts?.[0]?.email && (
                                        <div className="flex items-center gap-1 text-xs text-gray-600 group-hover:text-white">
                                          <Mail className="w-3 h-3" />
                                          <span className="truncate">{customer.contacts[0].email}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    Payment Details
                  </label>

                  {/* Amount Received */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-cyan-600 uppercase tracking-wider">
                      Amount Received
                    </label>
                    <div className="md:col-span-2">
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={paymentData.amountReceived}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || /^\d*\.?\d*$/.test(val)) {
                            setPaymentData(prev => ({ ...prev, amountReceived: val as any }));
                          }
                        }}
                        required
                        prefix={paymentData.currency}
                        placeholder="0.00"
                        showLabel={false}
                        className="w-full rounded-xl"
                      />
                      {/* Checkbox - Pay All Remaining */}
                      {selectedCustomerData && unpaidInvoices.length > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="payAllRemaining"
                            checked={payAllRemaining}
                            onChange={handlePayAllRemainingToggle}
                            className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500 cursor-pointer"
                          />
                          <label htmlFor="payAllRemaining" className="text-sm text-gray-600 cursor-pointer select-none">
                            Receive full amount ({paymentData.currency} {unpaidInvoices.reduce((sum, inv) => sum + Number(inv.remaining || 0), 0).toFixed(2)})
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bank Charges */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Bank Charges (if any)
                    </label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={paymentData.bankCharges}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^\d*\.?\d*$/.test(val)) {
                          setPaymentData(prev => ({ ...prev, bankCharges: val as any }));
                        }
                      }}
                      placeholder="0.00"
                      showLabel={false}
                      className="w-full rounded-xl"
                    />
                  </div>

                  {/* Payment Date */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-cyan-600 uppercase tracking-wider">
                      Payment Date
                    </label>
                    <Input
                      type="date"
                      value={paymentData.paymentDate}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, paymentDate: e.target.value }))}
                      required
                      showLabel={false}
                      className="w-full rounded-xl"
                    />
                  </div>

                  {/* Payment Mode */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Payment Mode
                    </label>
                    <Select
                      value={paymentData.paymentMode}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, paymentMode: e.target.value as any }))}
                      options={paymentModeOptions}
                      required
                      showLabel={false}
                      className="w-full rounded-xl"
                    />
                  </div>

                  {/* Reference No */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Reference No
                    </label>
                    <Input
                      value={paymentData.referenceNo}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, referenceNo: e.target.value }))}
                      placeholder="Optional"
                      showLabel={false}
                      className="w-full rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Unpaid Invoices Table */}
          {selectedCustomerData && unpaidInvoices.length > 0 && (
            <div className="mt-8">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 block">Unpaid Invoices</label>

              <div className="bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-200 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">DATE</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">INVOICE NUMBER</th>
                        <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">INVOICE AMOUNT</th>
                        <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">AMOUNT DUE</th>
                        <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">PAYMENT DATE</th>
                        <th className="px-4 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">PAYMENT</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {unpaidInvoices.map((invoice) => (
                        <tr key={invoice.id || invoice.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {invoice.dueDate
                              ? new Date(invoice.dueDate).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                              : ""}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">{invoice.invoiceNumber}</td>
                          <td className="px-4 py-4 text-sm text-gray-900 text-right">{(invoice.total || 0).toFixed(2)}</td>
                          <td className="px-4 py-4 text-sm text-gray-900 text-right">{(invoice.remaining || 0).toFixed(2)}</td>
                          <td className="px-4 py-4 text-center">
                            <input
                              type="date"
                              value={paymentData.paymentDate}
                              readOnly
                              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                            />
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={appliedAmounts[invoice.id] || 0}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                    handleAppliedAmountChange(invoice.id, val);
                                  }
                                }}
                                className="w-24 px-3 py-1.5 text-sm border border-gray-400 rounded-lg text-right text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                              />
                              <button
                                type="button"
                                onClick={() => handlePayInFull(invoice.id, invoice.remaining)}
                                className="text-blue-600 text-sm hover:underline"
                              >
                                Pay in Full
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                  <div className="text-xs text-gray-600 mb-2">**List contains only SENT invoices</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-900">Total</span>
                      <span className="text-sm font-semibold text-gray-900">{totalApplied.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-200 py-2">
                      <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Amount Received:</span>
                      <span className="text-base font-bold text-gray-900">
                        {(Number(paymentData.amountReceived) || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Amount used for Payments:</span>
                      <span className="text-sm text-gray-900">{totalApplied.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Amount Refunded:</span>
                      <span className="text-sm text-gray-900">0.00</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-sm font-black text-gray-900 uppercase tracking-tighter">Amount in Excess:</span>
                      <span className="text-xl font-black text-blue-600 tracking-tighter">
                        {paymentData.currency} {amountInExcess.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Fixed Footer Actions */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 px-8 py-5 flex items-center justify-start gap-3 z-40 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <Button
          onClick={() => {
            localStorage.removeItem('selectedPayment');
            navigate('/payments');
          }}
          variant="ghost"
          size="md"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSaveDraft}
          disabled={isSaving || isSubmitting || !isFormValid}
          variant="secondary"
          size="md"
          title={!isFormValid ? 'Please select a customer and enter a valid amount' : ''}
        >
          {isSaving ? 'Saving...' : 'Save as Draft'}
        </Button>
        <Button
          onClick={handleSaveAndSend}
          disabled={isSubmitting || isSaving || !isFormValid}
          variant="primary"
          size="md"
          title={!isFormValid ? 'Please select a customer and enter a valid amount' : ''}
        >
          {isSubmitting ? 'Saving...' : 'Save & Send'}
        </Button>
      </div>
    </div>
  );
};

export default PaymentForm;
