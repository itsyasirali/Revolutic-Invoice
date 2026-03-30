import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useItemForm as useDomainItemForm } from './useItemForm';
import type { ItemFormData } from '../../types/items.d';

export const useItemFormView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [item, setItem] = useState<ItemFormData | null>(() => location.state?.item || null);

    useEffect(() => {
        if (location.state?.item) {
            setItem(location.state.item);
        }
    }, [location.state]);

    const {
        itemType,
        setItemType,
        handleSubmit,
        loading,
        alert,
        dismissAlert,
    } = useDomainItemForm(item);

    const handleFormSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const payload = {
            type: (formData.get('type') as 'Goods' | 'Service') || itemType,
            name: String(formData.get('name') || ''),
            unit: String(formData.get('unit') || ''),
            sellingPrice: formData.get('sellingPrice') ? Number(formData.get('sellingPrice')) : undefined,
            description: String(formData.get('description') || ''),
            status: (formData.get('status') as 'Active' | 'inActive') || 'Active',
        };

        await handleSubmit(payload);
        navigate('/items');
    }, [itemType, handleSubmit, navigate]);

    const handleCancel = useCallback(() => {
        navigate('/items');
    }, [navigate]);

    return {
        item,
        itemType,
        setItemType,
        handleFormSubmit,
        handleCancel,
        loading,
        alert,
        dismissAlert,
    };
};

export default useItemFormView;
