import { useState, useEffect, useMemo } from 'react';
import axios from '../../Service/axios';
import type { Template, TemplateListItem, UseTemplatesListReturn } from '../../types/template.d';

const useTemplatesList = (): UseTemplatesListReturn => {
    const [templates, setTemplates] = useState<TemplateListItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

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

    // Filter templates by search term
    const filteredTemplates = useMemo(() => {
        if (!searchTerm.trim()) {
            return templates;
        }
        return templates.filter((template) =>
            template.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [templates, searchTerm]);

    return {
        templates,
        loading,
        error,
        refetch: fetchTemplates,
        searchTerm,
        setSearchTerm,
        filteredTemplates,
    };
};

export default useTemplatesList;
