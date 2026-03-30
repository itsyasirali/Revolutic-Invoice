import React from 'react';
import { Mail, Phone, Building2, Edit, Trash2, FileText, MapPin, MessageSquare, User, DollarSign, Globe, Clock, CreditCard } from 'lucide-react';
import Table from '../common/Table';
import StatusBadge from '../common/StatusBadge';
import Tabs from '../common/Tabs';
import EmptyState from '../common/EmptyState';
import CurrencyDisplay from '../common/CurrencyDisplay';
import Button from '../common/Button';
import Card from '../common/Card';
import type { UIInvoiceListItem, PaymentTransaction } from '../../types/customer.d';
import type { TableColumn } from '../../types/common';
import PageHeader from '../common/PageHeader';
import useCustomerDetailsView, { type CustomerTab } from '../../hooks/customers/useCustomerDetailsView';

const CustomerDetails: React.FC = () => {
    const {
        customer,
        primaryContact,
        loading,
        deleteLoading,
        financials,
        customerInvoices,
        customerTransactions,
        activeTab,
        setActiveTab,
        handleEdit,
        handleDelete,
        handleBackClick,
        handleInvoiceClick,
        handleTransactionClick,
    } = useCustomerDetailsView();

    const invoiceColumns: TableColumn<UIInvoiceListItem>[] = [
        {
            key: 'invoice',
            label: 'INVOICE NUMBER',
            sortable: true,
            render: (item) => (
                <span className="font-bold text-gray-900">{item.invoice}</span>
            ),
        },
        {
            key: 'date',
            label: 'DATE',
            sortable: true,
            render: (item) => <span className="text-gray-600">{item.date}</span>,
        },
        {
            key: 'dueDate',
            label: 'DUE DATE',
            render: (item) => <span className="text-gray-600">{item.dueDate || ''}</span>,
        },
        {
            key: 'amount',
            label: 'AMOUNT',
            align: 'right' as const,
            render: (item) => (
                <CurrencyDisplay
                    amount={Number(item.amount)}
                    currency={customer?.currency}
                    className="font-bold text-gray-900 text-right"
                />
            ),
        },
        {
            key: 'status',
            label: 'STATUS',
            render: (item) => (
                <StatusBadge status={item.status.tooltip} variant={item.status.color as 'default' | 'success' | 'danger' | 'warning' | 'info'} />
            ),
        },
    ];

    const transactionColumns: TableColumn<PaymentTransaction>[] = [
        {
            key: 'paymentDate',
            label: 'DATE',
            sortable: true,
            render: (item) => {
                const date = typeof item.paymentDate === 'string'
                    ? new Date(item.paymentDate).toLocaleDateString()
                    : item.paymentDate instanceof Date
                        ? item.paymentDate.toLocaleDateString()
                        : '';
                return <span className="text-gray-600">{date}</span>;
            },
        },
        {
            key: 'paymentNumber',
            label: 'PAYMENT #',
            sortable: true,
            render: (item) => (
                <span className="font-bold text-gray-900">
                    {item.paymentNumber ? `PMT-${String(item.paymentNumber).padStart(4, '0')}` : ''}
                </span>
            ),
        },
        {
            key: 'referenceNo',
            label: 'REFERENCE',
            render: (item) => (
                <span className="text-gray-600">{item.referenceNo || ''}</span>
            ),
        },
        {
            key: 'paymentMode',
            label: 'MODE',
            render: (item) => (
                <StatusBadge status={item.paymentMode} variant="default" />
            ),
        },
        {
            key: 'amountReceived',
            label: 'AMOUNT',
            render: (item) => (
                <CurrencyDisplay
                    amount={item.amountReceived}
                    currency={item.currency || customer?.currency}
                    className="font-bold text-gray-900"
                />
            ),
        },
    ];

    if (loading && !customer) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>;
    }

    if (!customer) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <EmptyState
                    icon={FileText}
                    title="Customer Not Found"
                    message="The customer you're looking for doesn't exist or data is not available."
                    action={{
                        label: 'Back to Customers',
                        onClick: handleBackClick,
                    }}
                />
            </div>
        );
    }

    const tabs = [
        { label: 'Overview', value: 'overview' },
        { label: 'Invoices', value: 'invoices', count: customerInvoices.length },
        { label: 'Transactions', value: 'transactions', count: customerTransactions.length },
    ];

    return (
        <div className="bg-white">
            <PageHeader
                title={customer.displayName || ''}
                onBack={handleBackClick}
                subtitle={
                    <>
                        <span className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4" />
                            {customer.companyName || 'No Company'}
                        </span>
                        {customer.currency && (
                            <span className="flex items-center gap-1.5">
                                <Globe className="w-4 h-4" />
                                {customer.currency}
                            </span>
                        )}
                        <StatusBadge status={customer.status || 'Active'} />
                    </>
                }
                actions={
                    <>
                        <Button
                            variant="ghost"
                            onClick={handleEdit}
                            icon={<Edit className="w-4 h-4" />}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDelete}
                            loading={deleteLoading}
                            icon={<Trash2 className="w-4 h-4" />}
                        >
                            Delete
                        </Button>
                    </>
                }
            />

            {/* Quick Stats */}
            <div className="px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card padding="md" className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Received</p>
                            <CurrencyDisplay
                                amount={financials.received}
                                currency={customer.currency}
                                className="text-xl font-bold text-gray-900"
                            />
                        </div>
                    </Card>
                    <Card padding="md" className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Remaining</p>
                            <CurrencyDisplay
                                amount={financials.remaining}
                                currency={customer.currency}
                                className="text-xl font-bold text-gray-900"
                            />
                        </div>
                    </Card>
                </div>
            </div>

            {/* Tabs & Content */}
            <div className="px-8 flex flex-col gap-6">
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-6 border-b border-gray-50">
                        <Tabs
                            tabs={tabs}
                            activeTab={activeTab}
                            onTabChange={(value) => setActiveTab(value as CustomerTab)}
                        />
                    </div>

                    <div className="p-6">
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    <section>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">
                                            General Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-50">
                                                <p className="text-xs font-medium text-gray-500 mb-1">Customer Type</p>
                                                <p className="text-sm font-semibold text-gray-900">{customer.customerType || 'Individual'}</p>
                                            </div>
                                            <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-50">
                                                <p className="text-xs font-medium text-gray-500 mb-1">Currency</p>
                                                <p className="text-sm font-semibold text-gray-900">{customer.currency || 'USD'}</p>
                                            </div>
                                            <div className="md:col-span-2 p-4 bg-gray-50/50 rounded-xl border border-gray-50">
                                                <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5" /> Address
                                                </p>
                                                <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                                                    {customer.address || 'No address provided'}
                                                </p>
                                            </div>
                                            {customer.remarks && (
                                                <div className="md:col-span-2 p-4 bg-gray-50/50 rounded-xl border border-gray-50">
                                                    <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1.5">
                                                        <MessageSquare className="w-3.5 h-3.5" /> Remarks
                                                    </p>
                                                    <p className="text-sm text-gray-600 italic">
                                                        "{customer.remarks}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>

                                {/* Sidebar - Contact Info */}
                                <div className="space-y-6">
                                    <Card padding="md" className="bg-primary/5 border-primary/10">
                                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-5 flex items-center gap-2">
                                            <User className="w-4 h-4" /> Primary Contact
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                                    <User className="w-4 h-4 text-primary" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Full Name</p>
                                                    <p className="text-sm font-bold text-gray-900 truncate">{primaryContact.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                                    <Mail className="w-4 h-4 text-primary" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Email Address</p>
                                                    <p className="text-sm font-bold text-gray-900 truncate">{primaryContact.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                                    <Phone className="w-4 h-4 text-primary" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Mobile Number</p>
                                                    <p className="text-sm font-bold text-gray-900">{primaryContact.phone}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {activeTab === 'invoices' && (
                            <div className="-m-6">
                                {customerInvoices.length > 0 ? (
                                    <Table
                                        columns={invoiceColumns}
                                        data={customerInvoices}
                                        selectedIds={[]}
                                        onSelectAll={() => { }}
                                        onSelectRow={() => { }}
                                        getRowId={(item) => item.id}
                                        onRowClick={(item) => handleInvoiceClick(item.id)}
                                        emptyMessage="No invoices found"
                                        showCheckbox={false}
                                    />
                                ) : (
                                    <div className="py-20">
                                        <EmptyState
                                            icon={FileText}
                                            title="No Invoices"
                                            message="This customer doesn't have any invoices yet."
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'transactions' && (
                            <div className="-m-6">
                                {customerTransactions.length > 0 ? (
                                    <Table
                                        columns={transactionColumns}
                                        data={customerTransactions}
                                        selectedIds={[]}
                                        onSelectAll={() => { }}
                                        onSelectRow={() => { }}
                                        getRowId={(item) => item.id || item.id}
                                        onRowClick={(item) => handleTransactionClick(item.id || item.id)}
                                        emptyMessage="No transactions found"
                                        showCheckbox={false}
                                    />
                                ) : (
                                    <div className="py-20">
                                        <EmptyState
                                            icon={DollarSign}
                                            title="No Transactions"
                                            message="No payment transactions found for this customer."
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetails;
