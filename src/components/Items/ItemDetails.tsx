import React from 'react';
import { Package, Edit, Trash2, FileText, Type, Tag, DollarSign } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import Button from '../common/Button';
import PageHeader from '../common/PageHeader';
import useItemDetailsView from '../../hooks/items/useItemDetailsView';

const ItemDetails: React.FC = () => {
    const {
        item,
        loading,
        handleEdit,
        handleDelete,
        handleBackClick,
    } = useItemDetailsView();

    if (!item) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <EmptyState
                    icon={FileText}
                    title="Item Not Found"
                    message="The item you're looking for doesn't exist or data is not available."
                    action={{
                        label: 'Back to Items',
                        onClick: handleBackClick,
                    }}
                />
            </div>
        );
    }

    return (
        <div className="bg-white">
            <PageHeader
                title={item.name || ''}
                onBack={handleBackClick}
                subtitle={
                    <>
                        <span className="flex items-center gap-1.5">
                            <Package className="w-4 h-4" />
                            {item.type || 'Goods'}
                        </span>
                        <StatusBadge status={item.status || 'Active'} />
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
                            loading={loading}
                            icon={<Trash2 className="w-4 h-4" />}
                        >
                            Delete
                        </Button>
                    </>
                }
            />

            <div className="px-8 py-8 max-w-5xl">
                <div className="flex flex-col gap-8">
                    <div className="space-y-8">
                        <section>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">
                                Item Information
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-5 bg-gray-50/50 rounded-xl border border-gray-50">
                                    <p className="text-sm font-medium text-gray-500 mb-1.5 flex items-center gap-2">
                                        <Type className="w-4 h-4" /> Type
                                    </p>
                                    <p className="text-base font-semibold text-gray-900">{item.type || 'Goods'}</p>
                                </div>
                                <div className="p-5 bg-gray-50/50 rounded-xl border border-gray-50">
                                    <p className="text-sm font-medium text-gray-500 mb-1.5 flex items-center gap-2">
                                        <Tag className="w-4 h-4" /> Unit
                                    </p>
                                    <p className="text-base font-semibold text-gray-900">{item.unit || ''}</p>
                                </div>
                                <div className="p-5 bg-gray-50/50 rounded-xl border border-gray-50">
                                    <p className="text-sm font-medium text-gray-500 mb-1.5 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" /> Selling Price
                                    </p>
                                    <p className="text-base font-semibold text-gray-900">
                                        {item.sellingPrice !== undefined
                                            ? `PKR ${item.sellingPrice.toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}`
                                            : ''}
                                    </p>
                                </div>
                                {item.description && (
                                    <div className="p-5 bg-gray-50/50 rounded-xl border border-gray-50">
                                        <p className="text-sm font-medium text-gray-500 mb-1.5 flex items-center gap-2">
                                            <FileText className="w-4 h-4" /> Description
                                        </p>
                                        <p className="text-base text-gray-600 leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemDetails;
