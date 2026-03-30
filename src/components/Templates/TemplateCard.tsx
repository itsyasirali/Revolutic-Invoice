import React from 'react';
import { Pencil, Settings, Eye, Copy, Trash2, CheckCircle } from 'lucide-react';
import type { TemplateListItem } from '../../types/template.d';
import type { DropdownMenuItem } from '../../types/common';
import TemplatePreview from './TemplatePreview';
import DropdownMenu from '../common/DropdownMenu';

interface TemplateCardProps {
    template: TemplateListItem;
    index: number;
    onEdit: (id: string) => void;
    onSetActive: (id: string) => void;
    onPreview: (template: TemplateListItem) => void;
    onClone?: (template: TemplateListItem) => void;
    onDelete?: (id: string) => void;
    mode?: 'manage' | 'select';
    selected?: boolean;
    onClick?: (template: TemplateListItem) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
    template,
    index,
    onEdit,
    onSetActive,
    onPreview,
    onClone,
    onDelete,
    mode = 'manage',
    selected = false,
    onClick,
}) => {
    // Styling for selection mode
    const isSelectMode = mode === 'select';
    const selectionBorderClass = selected
        ? 'ring-4 ring-blue-500 ring-offset-2'
        : isSelectMode
            ? 'hover:ring-2 hover:ring-blue-300 ring-offset-1 cursor-pointer'
            : '';

    const handleCardClick = () => {
        if (isSelectMode && onClick) {
            onClick(template);
        }
    };

    const menuItems: DropdownMenuItem[] = [
        ...(template.isDefault
            ? []
            : [{
                icon: CheckCircle,
                label: 'Set as Default',
                onClick: () => onSetActive(template.id),
            }]),
        {
            icon: Eye,
            label: 'Preview',
            onClick: () => onPreview(template),
        },
        ...(onClone ? [{
            icon: Copy,
            label: 'Clone',
            onClick: () => onClone(template),
        }] : []),
        ...(onDelete ? [{
            icon: Trash2,
            label: 'Delete',
            onClick: () => onDelete(template.id),
            variant: 'danger' as const,
        }] : []),
    ];

    return (
        <div
            className={`group relative transition-all duration-300 overflow-hidden ${selectionBorderClass}`}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={handleCardClick}
        >
            {/* Preview Area */}
            <div className="relative overflow-hidden" style={{ height: '400px' }}>
                {/* Paper Preview - renders at A4 size, then scales down */}
                <div
                    className="transform origin-top-left bg-white shadow-lg"
                    style={{
                        width: '210mm',
                        height: '297mm',
                        transform: 'scale(0.35)',
                        pointerEvents: 'none',
                    }}
                >
                    <TemplatePreview data={template.raw || template} />
                </div>

                {/* Hover Overlay with Action Buttons - only in manage mode */}
                {mode === 'manage' && (
                    <div
                        className="absolute top-0 left-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3"
                        style={{
                            width: 'calc(210mm * 0.35)',
                            height: 'calc(297mm * 0.351)',
                        }}
                    >
                        <button
                            onClick={() => onEdit(template.id)}
                            className="flex items-center gap-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium shadow-lg"
                        >
                            <Pencil size={20} />
                        </button>
                        <DropdownMenu
                            items={menuItems}
                            trigger={
                                <button className="p-3 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg">
                                    <Settings size={20} />
                                </button>
                            }
                            align="right"
                        />
                    </div>
                )}
            </div>

            {/* Template Name */}
            <h3 className={`font-semibold mt-2 text-gray-900 text-lg truncate px-2 pb-2 ${selected ? 'text-blue-600' : ''}`}>
                {template.name}
            </h3>

            {/* Selection Checkmark */}
            {
                selected && (
                    <div className="absolute top-3 right-3 bg-blue-500 text-white rounded-full p-1 shadow-md">
                        <CheckCircle size={16} />
                    </div>
                )
            }
        </div >
    );
};

export default TemplateCard;
