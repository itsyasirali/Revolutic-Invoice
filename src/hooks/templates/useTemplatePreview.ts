import { useState, useCallback } from 'react';
import type { TemplateListItem } from '../../types/template.d';

export interface UseTemplatePreviewReturn {
    isOpen: boolean;
    selectedTemplate: TemplateListItem | null;
    zoomLevel: number;
    currentPage: number;
    openPreview: (template: TemplateListItem) => void;
    closePreview: () => void;
    setZoomLevel: (level: number) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    setCurrentPage: (page: number) => void;
}

const useTemplatePreview = (): UseTemplatePreviewReturn => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateListItem | null>(null);
    const [zoomLevel, setZoomLevel] = useState(89);
    const [currentPage, setCurrentPage] = useState(1);

    const openPreview = useCallback((template: TemplateListItem) => {
        setSelectedTemplate(template);
        setIsOpen(true);
        setCurrentPage(1);
        setZoomLevel(89);
    }, []);

    const closePreview = useCallback(() => {
        setIsOpen(false);
        setSelectedTemplate(null);
    }, []);

    const zoomIn = useCallback(() => {
        setZoomLevel((prev) => Math.min(prev + 10, 200));
    }, []);

    const zoomOut = useCallback(() => {
        setZoomLevel((prev) => Math.max(prev - 10, 25));
    }, []);

    return {
        isOpen,
        selectedTemplate,
        zoomLevel,
        currentPage,
        openPreview,
        closePreview,
        setZoomLevel,
        zoomIn,
        zoomOut,
        setCurrentPage,
    };
};

export default useTemplatePreview;
