import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Item } from '../../types/items.d';

type UseItemDetailsProps = {
    items: Item[];
    deleteItems: (ids: string[], callback?: () => void) => Promise<void>;
    deleteLoading: boolean;
};

const useItemDetails = ({
    items,
    deleteItems,
    deleteLoading
}: UseItemDetailsProps) => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [showMenu, setShowMenu] = useState(false);

    // Find current item using useMemo
    const item = useMemo<Item | undefined>(
        () => items.find((i) => i.id === Number(id)),
        [items, id]
    );

    const handleEdit = useCallback(() => {
        if (item) {
            navigate(`/items/edit/${item.id}`);
            setShowMenu(false);
        }
    }, [item, navigate]);

    const handleDelete = useCallback(async () => {
        if (item) {
            await deleteItems([String(item.id)], () => navigate('/items'));
        }
        setShowMenu(false);
    }, [item, deleteItems, navigate]);

    const handleBackClick = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    return {
        item,
        showMenu,
        setShowMenu,
        handleEdit,
        handleDelete,
        handleBackClick,
        deleteLoading
    };
};

export default useItemDetails;
