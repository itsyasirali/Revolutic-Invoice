import React from 'react';
import { Info } from 'lucide-react';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import AlertModal from '../common/AlertModal';
import PageHeader from '../common/PageHeader';
import useItemFormView from '../../hooks/items/useItemFormView';

const ItemForm: React.FC = () => {
  const {
    item,
    itemType,
    setItemType,
    handleFormSubmit,
    handleCancel,
    loading,
    alert,
    dismissAlert,
  } = useItemFormView();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PageHeader
        title={item ? 'Update Item' : 'New Item'}
        onBack={handleCancel}
      />

      <AlertModal
        isOpen={alert.show}
        type={alert.type}
        message={alert.message}
        onClose={dismissAlert}
      />

      <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 py-8 px-8 max-w-3xl">
          <div className="flex flex-col gap-y-6">
            <div>
              <label className="text-base font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2 mb-3">
                Item Type
                <Info className="w-4 h-4 text-gray-400" />
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="type"
                    value="Goods"
                    checked={itemType === 'Goods'}
                    onChange={() => setItemType('Goods')}
                    className="w-5 h-5 text-primary border-gray-300 focus:ring-primary/20"
                  />
                  <span className="text-base font-medium text-gray-700 group-hover:text-gray-900">Goods</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="type"
                    value="Service"
                    checked={itemType === 'Service'}
                    onChange={() => setItemType('Service')}
                    className="w-5 h-5 text-primary border-gray-300 focus:ring-primary/20"
                  />
                  <span className="text-base font-medium text-gray-700 group-hover:text-gray-900">Service</span>
                </label>
              </div>
            </div>

            <Input
              type="text"
              name="name"
              label="Name"
              placeholder="Enter item name"
              defaultValue={item?.name || ''}
              required
              fullWidth
            />

            <Input
              type="text"
              name="unit"
              label="Unit"
              placeholder="e.g. pcs, kg, hours"
              defaultValue={item?.unit || ''}
              fullWidth
            />

            <Input
              type="number"
              step="0.01"
              name="sellingPrice"
              label="Selling Price"
              placeholder="0.00"
              defaultValue={item?.sellingPrice ?? ''}
              fullWidth
            />

            <div>
              <Textarea
                name="description"
                label="Description"
                rows={4}
                defaultValue={item?.description || ''}
                placeholder="Enter item description"
                fullWidth
              />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-gray-100 px-8 py-4 flex justify-start gap-3 z-10">
          <Button
            type="button"
            onClick={handleCancel}
            variant="ghost"
            size="md"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            size="md"
            loading={loading}
          >
            {item ? 'Update Item' : 'Create Item'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ItemForm;
