import React, { useState } from 'react';
import { Minus, Plus, RotateCcw, RotateCw, Download, MoreVertical, PanelLeftClose, PanelLeft } from 'lucide-react';
import type { TemplateListItem } from '../../types/template.d';
import TemplatePreview from './TemplatePreview';

import html2pdf from 'html2pdf.js';

interface TemplatePreviewModalProps {
    isOpen: boolean;
    template: TemplateListItem | null;
    zoomLevel: number;
    currentPage: number;
    totalPages?: number;
    onClose: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onPageChange: (page: number) => void;
    onPrint?: () => void;
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
    isOpen,
    template,
    zoomLevel,
    currentPage,
    totalPages = 1,
    onClose,
    onZoomIn,
    onZoomOut,
    onPageChange,
}) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    if (!isOpen || !template) return null;

    const handleDownload = () => {
        const element = document.getElementById('pdf-print-area');
        if (!element) return;

        // Clone the element to render it for PDF generation
        const clone = element.cloneNode(true) as HTMLElement;
        clone.classList.remove('hidden');
        clone.classList.add('block');
        clone.style.position = 'relative';
        clone.style.width = '210mm';
        clone.style.height = 'auto'; // ensure height matches content

        // Create a temporary container off-screen
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = '210mm';
        container.appendChild(clone);
        document.body.appendChild(container);

        const opt = {
            margin: 0,
            filename: `invoice-${template.name || 'preview'}.pdf`,
            image: { type: 'jpeg' as 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as 'portrait' }
        };

        html2pdf().set(opt).from(clone).save().then(() => {
            document.body.removeChild(container);
        });
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <>
            {/* Backdrop Overlay */}
            <div
                className="fixed inset-0 z-40 bg-black/50"
                onClick={onClose}
            />

            {/* Modal Container - Wider with less top margin */}
            <div className="fixed left-2 right-2 top-0 bottom-2 z-50 flex flex-col bg-white w-[80%] h-[80%] mx-auto overflow-hidden rounded-lg shadow-2xl">
                {/* Header - Compact */}
                <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200">
                    <h2 className="text-base font-medium text-gray-900">Preview</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <Download size={16} />
                            Download
                        </button>
                        <button
                            onClick={onClose}
                            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Toolbar - Compact */}
                <div className="flex items-center gap-4 px-4 py-1.5 bg-gray-700 border-b border-gray-600">
                    {/* Sidebar Toggle */}
                    <button
                        onClick={toggleSidebar}
                        className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-600 rounded transition-colors"
                        title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
                    >
                        {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
                    </button>

                    <span className="text-gray-300 text-sm">preview</span>

                    <div className="flex-1" />

                    {/* Page Navigation */}
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={currentPage}
                            onChange={(e) => onPageChange(Number(e.target.value))}
                            min={1}
                            max={totalPages}
                            className="w-8 px-1 py-0.5 text-sm text-center text-white bg-blue-600 rounded border-none focus:outline-none"
                        />
                        <span className="text-gray-400 text-sm">/ {totalPages}</span>
                    </div>

                    <div className="w-px h-5 bg-gray-600" />

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={onZoomOut}
                            className="p-1 text-gray-300 hover:text-white hover:bg-gray-600 rounded transition-colors"
                        >
                            <Minus size={16} />
                        </button>
                        <span className="text-white text-sm min-w-[45px] text-center">{zoomLevel}%</span>
                        <button
                            onClick={onZoomIn}
                            className="p-1 text-gray-300 hover:text-white hover:bg-gray-600 rounded transition-colors"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    <div className="w-px h-5 bg-gray-600" />

                    {/* Additional Tools */}
                    <div className="flex items-center gap-0.5">
                        <button className="p-1 text-gray-300 hover:text-white hover:bg-gray-600 rounded transition-colors">
                            <RotateCcw size={16} />
                        </button>
                        <button className="p-1 text-gray-300 hover:text-white hover:bg-gray-600 rounded transition-colors">
                            <RotateCw size={16} />
                        </button>
                    </div>

                    <div className="flex-1" />

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-0.5">
                        <button className="p-1 text-gray-300 hover:text-white hover:bg-gray-600 rounded transition-colors">
                            <MoreVertical size={16} />
                        </button>
                    </div>
                </div>

                {/* Content Area - Height 50% */}
                <div className="flex flex-1 overflow-hidden h-[50%]">
                    {/* Left Sidebar - Page Thumbnails (Toggleable) */}
                    {sidebarOpen && (
                        <div className="w-48 bg-gray-800 border-r border-gray-700 p-3 overflow-y-auto transition-all duration-300">
                            {/* Single Page Thumbnail */}
                            <button
                                onClick={() => onPageChange(1)}
                                className={`w-full rounded-lg overflow-hidden border-2 transition-colors ${currentPage === 1
                                    ? 'border-blue-500'
                                    : 'border-transparent hover:border-gray-600'
                                    }`}
                            >
                                <div className="bg-white aspect-[210/297] relative overflow-hidden">
                                    <div
                                        className="transform origin-top-left"
                                        style={{
                                            width: '210mm',
                                            height: '297mm',
                                            transform: 'scale(0.18)',
                                        }}
                                    >
                                        <TemplatePreview data={template.raw || template} />
                                    </div>
                                </div>

                            </button>
                        </div>
                    )}

                    {/* Main Preview Area */}
                    <div className="flex-1 overflow-auto p-4 bg-gray-500">
                        <div className="flex items-start justify-center min-h-full">
                            <div
                                id="preview-area"
                                className="bg-white shadow-2xl"
                                style={{
                                    width: '210mm',
                                    minHeight: '297mm',
                                    transform: `scale(${zoomLevel / 100})`,
                                    transformOrigin: 'top center',
                                }}
                            >
                                <TemplatePreview data={template.raw || template} />
                            </div>
                        </div>
                    </div>
                </div>

                <div id="pdf-print-area" className="hidden print:block absolute top-0 left-0 m-0 p-0 pointer-events-none">
                    <div style={{ width: '210mm', minHeight: '296mm', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                        <TemplatePreview
                            data={template.raw || template}
                            style={{ minHeight: '100%', flexGrow: 1 }}
                            footerStyle={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '100%',
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default TemplatePreviewModal;
