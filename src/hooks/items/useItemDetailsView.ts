import { useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import useDeleteItems from './useItemsDelete';
import type { Item } from '../../types/items.d';

export const useItemDetailsView = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { deleteItems, loading: deleteLoading } = useDeleteItems();

    const item = useMemo<Item | null>(() => {
        return location.state?.item || null;
    }, [location.state]);

    const handleEdit = useCallback(() => {
        if (item) {
            navigate(`/items/edit/${id}`, { state: { item } });
        }
    }, [item, id, navigate]);

    const handleDelete = useCallback(async () => {
        if (id) {
            await deleteItems([id], () => {
                navigate('/items');
            });
        }
    }, [id, deleteItems, navigate]);

    const handleBackClick = useCallback(() => {
        navigate('/items');
    }, [navigate]);

    return {
        item,
        id,
        loading: deleteLoading,
        handleEdit,
        handleDelete,
        handleBackClick,
    };
};

export default useItemDetailsView;
