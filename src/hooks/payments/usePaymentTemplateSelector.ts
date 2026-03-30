import { useState, useEffect } from 'react';
import useTemplates from './useTemplates';

export interface UsePaymentTemplateSelectorReturn {
    templates: any[];
    loading: boolean;
    error: any;
    selectedId: string | undefined;
    setSelectedId: (id: string | undefined) => void;
    handleSelect: (template: any, onSelect: (template: any) => void, onClose: () => void) => void;
}

const usePaymentTemplateSelector = (currentTemplateId?: string): UsePaymentTemplateSelectorReturn => {
    const { templates, loading, error } = useTemplates();
    const [selectedId, setSelectedId] = useState<string | undefined>(currentTemplateId);

    // Update local selection when prop changes
    useEffect(() => {
        setSelectedId(currentTemplateId);
    }, [currentTemplateId]);

    const handleSelect = (template: any, onSelect: (template: any) => void, onClose: () => void) => {
        setSelectedId(template.id);
        onSelect(template);
        onClose();
    };

    return {
        templates,
        loading,
        error,
        selectedId,
        setSelectedId,
        handleSelect
    };
};

export default usePaymentTemplateSelector;
