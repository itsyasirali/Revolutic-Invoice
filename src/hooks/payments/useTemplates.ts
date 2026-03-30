import { useState, useEffect, useMemo } from 'react';
import axios from '../../Service/axios';
import type { Template, TemplateListItem } from '../../types/template.d';

interface UseTemplatesReturn {
    templates: TemplateListItem[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    defaultTemplate: TemplateListItem | undefined;
}

const useTemplates = (): UseTemplatesReturn => {
    const [templates, setTemplates] = useState<TemplateListItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(`/templates`);

            const templatesData: Template[] = response.data;

            // Transform to UI list items - backend returns 'id' not 'id'
            const listItems: TemplateListItem[] = templatesData.map((template) => ({
                id: template.id.toString(), // Convert numeric ID to string for UI
                name: template.templateName,
                paperSize: template.paperSize,
                orientation: template.orientation,
                isDefault: template.isDefault,
                createdAt: new Date(template.createdAt || '').toLocaleDateString(),
                raw: template,
            }));

            setTemplates(listItems);
        } catch (err: any) {
            console.error('Error fetching templates:', err);
            setError(err.response?.data?.message || 'Failed to fetch templates');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const defaultTemplate = useMemo(() => {
        return templates.find(t => t.isDefault);
    }, [templates]);

    return {
        templates,
        loading,
        error,
        refetch: fetchTemplates,
        defaultTemplate
    };
};

export default useTemplates;
