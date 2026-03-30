import { Search, Settings, ChevronDown, X, Eye, Plus, Info } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import Button from '../common/Button';
import PageHeader from '../common/PageHeader';
import Input from '../common/Input';
import Select from '../common/Select';
import useInvoiceForm from '../../hooks/invoices/useInvoiceForm';
import InvoiceTemplateSelector from './InvoiceTemplateSelector';
import { useState } from 'react';
import type { InvoiceCustomer } from '../../types/invoice.d';

const InvoiceForm = () => {
  const {
    // State
    isEditMode,
    items,
    invoiceData,
    customerDropdownOpen,
    customerSearchTerm,
    itemDropdownOpen,
    isSubmitting,
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
    handlePreview,
    handleCancel,
    handleSaveAndSend,

    // Calculations
    calculateTotal,
    calculateSubtotal,
  } = useInvoiceForm();

  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const busy = isSubmitting || saving || updating;

  // Check if form is valid for submission
  const isFormValid = invoiceData.customerId && items.length > 0 && items.some(item => item.name && item.name.trim() !== '');

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PageHeader
        title={isEditMode ? 'Edit Invoice' : 'New Invoice'}
        onBack={handleCancel}
      />

      <InvoiceTemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelect={(template) => handleInvoiceChange('templateId', template.id)}
        currentTemplateId={invoiceData.templateId}
      />

      <form onSubmit={(e) => { e.preventDefault(); handleSaveAndSend(); }} className="flex-1 flex flex-col">
        <div className="flex-1 py-8 px-8  w-full">
          <div className="flex flex-col gap-y-8">
            {/* Top Section: Customer & Invoice Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Column 1: Customer Details */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  Customer Details
                  <Info className="w-4 h-4 text-gray-400" />
                </label>

                <div className="">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="relative" ref={customerDropdownRef}>
                      <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                        Customer
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Select or add a customer"
                          value={isEditMode ? (customerSearchTerm || invoiceData.customerName) : customerSearchTerm}
                          onChange={(e) => {
                            if (!isEditMode) {
                              setCustomerSearchTerm(e.target.value);
                              setCustomerDropdownOpen(true);
                            }
                          }}
                          onFocus={() => {
                            if (!isEditMode) setCustomerDropdownOpen(true);
                          }}
                          disabled={isEditMode}
                          className={`w-full pl-3 pr-3 py-3 text-sm border border-gray-200 rounded-xl transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary ${isEditMode ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
                        />
                        {!isEditMode && (
                          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        )}
                      </div>

                      {customerDropdownOpen && !isEditMode && (
                        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="sticky top-0 bg-gray-50/80 backdrop-blur-md border-b border-gray-100 p-3">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <input
                                type="text"
                                placeholder="Search customers..."
                                value={customerSearchTerm}
                                onChange={(e) => setCustomerSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                autoFocus
                              />
                            </div>
                          </div>

                          {customersLoading ? (
                            <div className="p-8 text-center text-sm text-gray-500">Loading customers...</div>
                          ) : filteredCustomers.length === 0 ? (
                            <div className="p-8 text-center text-sm text-gray-500">No customers found</div>
                          ) : (
                            <div className="py-1">
                              {filteredCustomers.map((customer) => (
                                <button
                                  key={customer.id}
                                  type="button"
                                  onClick={() => selectCustomer(customer as InvoiceCustomer)}
                                  className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors border-b border-gray-50 last:border-b-0 group"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                                      {(customer.displayName || customer.companyName || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-semibold text-sm text-gray-900 truncate">{customer.displayName || customer.companyName}</div>
                                      <div className="text-xs text-gray-500 truncate">{customer.contacts?.[0]?.email || 'No email provided'}</div>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <Input
                      label="Email"
                      value={invoiceData.customerEmail}
                      placeholder='Customer Email'
                      readOnly
                      fullWidth
                      className="bg-gray-50/50"
                    />
                    <Input
                      label="Phone"
                      value={invoiceData.customerPhone}
                      placeholder='Customer Phone'
                      readOnly
                      fullWidth
                      className="bg-gray-50/50"
                    />
                    <Input
                      label="Address"
                      value={invoiceData.customerAddress}
                      placeholder='Customer Address'
                      readOnly
                      fullWidth
                      className="bg-gray-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* Column 2: Invoice Details */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  Invoice Details
                  <Settings className="w-4 h-4 text-gray-400" />
                </label>

                <div className="">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="relative">
                      <Input
                        label="Invoice Number"
                        value={invoiceData.invoiceNumber}
                        onChange={(e) => handleInvoiceChange('invoiceNumber', e.target.value)}
                        fullWidth
                        className="pr-10"
                      />
                      <Settings
                        className="absolute right-3 top-[34px] w-4 h-4 text-gray-400 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => setShowTemplateSelector(true)}
                      />
                    </div>

                    <Select
                      label="Payment Terms"
                      value={invoiceData.terms}
                      onChange={(e) => handleTermsChange(e.target.value)}
                      fullWidth
                      options={[
                        { label: 'Due on Receipt', value: 'Due on Receipt' },
                        { label: 'Net 15', value: 'Net 15' },
                        { label: 'Net 30', value: 'Net 30' },
                        { label: 'Net 60', value: 'Net 60' },
                      ]}
                    />

                    <Input
                      type="date"
                      label="Invoice Date"
                      value={invoiceData.invoiceDate}
                      onChange={(e) => handleInvoiceChange('invoiceDate', e.target.value)}
                      fullWidth
                    />

                    <Input
                      type="date"
                      label="Due Date"
                      value={invoiceData.dueDate}
                      onChange={(e) => handleInvoiceChange('dueDate', e.target.value)}
                      fullWidth
                      readOnly
                      className="bg-gray-50/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Item Details</label>
              </div>

              <div className="bg-white border border-gray-100">
                <div className="bg-gray-200 px-6 py-4 border-b border-gray-100 hidden md:block">
                  <div className="grid grid-cols-12 gap-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                    <div className="col-span-5">Item Details</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-2 text-right">Rate</div>
                    <div className="col-span-2 text-right">Amount</div>
                    <div className="col-span-1 text-right">Action</div>
                  </div>
                </div>

                <div className="bg-gray-50">
                  {items.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                        {/* Item Name & Selector */}
                        <div className="md:col-span-5 relative" ref={(el) => { itemDropdownRefs.current[item.id] = el; }}>
                          <input
                            type="text"
                            placeholder="Search or type item..."
                            value={item.name}
                            readOnly
                            onClick={() => setItemDropdownOpen((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                            className="w-full px-4 py-2.5 text-sm border border-gray-400 rounded-md cursor-pointer bg-white font-medium"
                          />
                          {itemDropdownOpen[item.id] && (
                            <div className="absolute z-50 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                              {itemsLoading ? (
                                <div className="p-4 text-center text-sm text-gray-500">Loading items...</div>
                              ) : itemsData.length === 0 ? (
                                <div className="p-4 text-center text-sm text-gray-500">No items available</div>
                              ) : (
                                <div className="py-1">
                                  {itemsData
                                    .filter(invItem => !items.some(i => i.itemId === String(invItem.id) && i.id !== item.id))
                                    .map((invItem) => (
                                      <button
                                        key={invItem.id}
                                        type="button"
                                        onClick={() => selectItem(item.id, invItem)}
                                        className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors border-b border-gray-50 last:border-b-0"
                                      >
                                        <div className="font-semibold text-sm text-gray-900">{invItem.name}</div>
                                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                          <span className="font-medium text-primary">{invItem.sellingPrice} {invoiceData.currency}</span>
                                          {invItem.unit && <span className="text-gray-300">|</span>}
                                          <span>{invItem.unit}</span>
                                        </div>
                                      </button>
                                    ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Quantity */}
                        <div className="md:col-span-2">
                          <div className="flex items-center gap-2 md:hidden mb-1 font-bold text-xs text-gray-500">QTY</div>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                updateItem(item.id, 'quantity', val === '.' ? '0.' : val);
                              }
                            }}
                            className="w-full px-3 py-2.5 text-sm border border-gray-400 rounded-md text-center bg-gray-50"
                          />
                        </div>

                        {/* Rate */}
                        <div className="md:col-span-2">
                          <div className="flex items-center gap-2 md:hidden mb-1 font-bold text-xs text-gray-500">RATE</div>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={item.rate}
                            readOnly
                            className="w-full px-3 py-2.5 text-sm border border-gray-400 rounded-md text-right bg-gray-50"
                          />
                        </div>

                        {/* Line Total */}
                        <div className="md:col-span-2">
                          <div className="text-xs text-gray-400 md:hidden uppercase font-bold mb-1">Total</div>
                          <div className="w-full px-3 py-2.5 text-sm border border-gray-400 rounded-md text-right bg-gray-50 font-bold text-gray-900">
                            {item.amount.toFixed(2)}
                          </div>
                        </div>

                        {/* Action column */}
                        <div className="md:col-span-1 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => deleteItem(item.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Remove line"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Row Button */}
                <div className="bg-gray-50 p-4 border-t border-gray-50">
                  <Button
                    variant='primary'
                    size='md'
                    onClick={addNewRow}
                  >
                    <Plus className="w-4 h-4" />
                    Add New Row
                  </Button>
                </div>

                {/* Totals Section */}


                {/* Notes Section */}

              </div>
              <div className="space-y-4 my-6">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider mt-4">Notes</label>
                <div className="bg-white rounded-md border border-gray-200 mt-4 overflow-hidden focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-300">
                  <style>{`
                    .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #f3f4f6 !important; background: #e5e7eb; padding: 12px 20px; }
                    .ql-container.ql-snow { border: none !important; font-size: 0.9375rem; color: #1f2937; }
                    .ql-editor { min-height: 180px; padding: 10px; line-height: 1.6; }
                    .ql-editor.ql-blank::before { color: #9ca3af; font-style: normal; opacity: 0.7; }
              `}</style>
                  <ReactQuill
                    theme="snow"
                    value={invoiceData.notes}
                    onChange={(value) => handleInvoiceChange('notes', value)}
                    placeholder="Payment details, special terms, or a thank you message..."
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, false] }],
                        ['bold', 'italic', 'underline'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        ['link', 'clean']
                      ]
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="p-8 space-y-3">
              {/* Subtotal */}
              <div className="flex justify-end items-center">
                <div className="flex items-center gap-4 w-full max-w-sm justify-between">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Subtotal</span>
                  <span className="text-base font-bold text-gray-900 w-32 text-right">{calculateSubtotal().toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-end items-center">
                <div className="flex items-center gap-4 w-full max-w-sm justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Discount</span>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={invoiceData.discountPercent}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || /^\d*\.?\d*$/.test(val)) {
                            if (val === '' || (Number(val) >= 0 && Number(val) <= 100)) {
                              handleInvoiceChange('discountPercent', val === '.' ? '0.' : val);
                            }
                          }
                        }}
                        className="w-20 pl-3 pr-7 py-1.5 text-xs border border-gray-400 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-right"
                      />
                      <span className="absolute right-2.5 text-gray-400 text-[10px] font-bold">%</span>
                    </div>
                  </div>
                  <span className="text-base font-bold text-red-500 w-32 text-right">
                    - {((calculateSubtotal() * (Number(invoiceData.discountPercent) || 0)) / 100).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex justify-end items-center pt-4 border-t border-gray-100 mt-2">
                <div className="flex items-center gap-4 w-full max-w-sm justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-gray-900 uppercase tracking-tighter">Total ({invoiceData.currency})</span>
                  </div>
                  <span className="text-xl font-black text-primary w-40 text-right tracking-tighter">
                    {calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer Actions */}
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 px-8 py-5 flex items-center justify-start gap-3 z-40 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
          <Button
            type="button"
            onClick={handleCancel}
            variant="ghost"
            size="md"
            disabled={busy}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSaveDraft}
            variant="secondary"
            size="md"
            disabled={busy || !isFormValid}
            loading={saving || updating}
          >
            {saving || updating ? 'Saving...' : 'Save as Draft'}
          </Button>

          <Button
            type="button"
            onClick={handlePreview}
            variant="primary"
            size="md"
            disabled={busy || !isFormValid}
            icon={<Eye className="w-4 h-4" />}
          >
            Preview
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
