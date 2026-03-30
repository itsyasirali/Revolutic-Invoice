import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
    ChevronRight,
    Upload,
    GripVertical,
    Plus,
    Trash2
} from 'lucide-react';
import useTemplateForm from '../../hooks/templates/useTemplateForm';
import Button from '../common/Button';
import TemplatePreview from './TemplatePreview';
import { useTemplateFormContext, type TemplateNavItem } from '../../context/TemplateFormContext';

// Helper to ensure color is a valid 7-character hex for the browser's color input
const getSafeHex = (color: string) => {
    if (!color) return '#000000';
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(color)) {
        if (color.length === 4) {
            // Convert #RGB to #RRGGBB
            return '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
        }
        return color;
    }
    return '#000000'; // Fallback for invalid formats like #07505
};

// Reusable color picker component with enhanced design
const ColorInput: React.FC<{ label: string; value: string; onChange: (val: string) => void }> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">{label}</label>
        <div className="flex items-center gap-2.5">
            <input
                type="color"
                value={getSafeHex(value)}
                onChange={(e) => onChange(e.target.value)}
                className="w-10 h-10 rounded-md border-2 border-gray-300 cursor-pointer shadow-sm hover:border-blue-400 transition-colors"
                title={value || '#000000'}
            />
            <input
                type="text"
                value={(value || '').toUpperCase()}
                onChange={(e) => onChange(e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`)}
                placeholder="#000000"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono text-gray-900 uppercase focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
        </div>
    </div>
);

// Label Style Editor Component - for customizing text, color, bg, and size
interface LabelStyleProps {
    label: string;
    textValue: string;
    textColor?: string;
    bgColor?: string;
    fontSize?: number;
    onTextChange: (val: string) => void;
    onTextColorChange?: (val: string) => void;
    onBgColorChange?: (val: string) => void;
    onFontSizeChange?: (val: number) => void;
    showBg?: boolean;
    showSize?: boolean;
}

const LabelStyleEditor: React.FC<LabelStyleProps> = ({
    label,
    textValue,
    textColor = '#1f2937',
    bgColor = 'transparent',
    fontSize = 10,
    onTextChange,
    onTextColorChange,
    onBgColorChange,
    onFontSizeChange,
    showBg = true,
    showSize = true,
}) => (
    <div className="space-y-3">
        <label className="block text-xs font-medium text-gray-700 mb-1.5">{label}</label>
        <div>
            <label className="text-xs text-gray-500 mb-1 block">Text</label>
            <input
                type="text"
                value={textValue}
                onChange={(e) => onTextChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
            />
        </div>

        <ColorInput
            label="Color"
            value={textColor}
            onChange={(v) => onTextColorChange?.(v)}
        />

        {showBg && (
            <ColorInput
                label="Background"
                value={bgColor === 'transparent' ? '#ffffff' : bgColor}
                onChange={(v) => onBgColorChange?.(v)}
            />
        )}

        {showSize && (
            <div>
                <label className="text-xs text-gray-500 mb-1 block">Size (pt)</label>
                <input
                    type="number"
                    value={fontSize}
                    onChange={(e) => onFontSizeChange?.(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
                />
            </div>
        )}
    </div>
);

// Collapsible Section Component
interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    icon?: React.ReactNode;
    id?: string;
}

const CollapsibleSection = ({ title, children, defaultOpen = false, icon, id }: CollapsibleSectionProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    // React to external open triggers and close others
    useEffect(() => {
        setIsOpen(defaultOpen);
    }, [defaultOpen]);

    return (
        <div id={id} className="border-b border-gray-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-sm font-medium text-gray-800">{title}</span>
                </div>
                <ChevronRight
                    size={16}
                    className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                />
            </button>
            {isOpen && (
                <div className="px-4 pb-4 space-y-4">
                    {children}
                </div>
            )}
        </div>
    );
};

const TemplateForm: React.FC = () => {
    const { id } = useParams();

    // Get ALL state and functions from hook (no local state)
    const {
        formData,
        handleChange,
        handleSubmit,
        loading,
        alert,
        dismissAlert,
        branding,
        setBrandName,
        setTagline,
        tableColumns,
        handleColumnChange,
        toggleColumn,
        addColumn,
        removeColumn,
        selectedElement,
        handleSelectElement,
        handleLogoUpload,
    } = useTemplateForm(id);

    const { activeNav, setActiveNav, setIsTemplateFormActive } = useTemplateFormContext();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Set template form as active when component mounts
    useEffect(() => {
        setIsTemplateFormActive(true);
        return () => setIsTemplateFormActive(false);
    }, [setIsTemplateFormActive]);

    // Auto-scroll to selected section
    useEffect(() => {
        if (selectedElement) {
            // Tiny delay to ensure DOM update if tab changed
            setTimeout(() => {
                const element = document.getElementById(`section-${selectedElement}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    }, [selectedElement, activeNav]);

    // Handle logo file selection
    const onLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleLogoUpload(file);
        }
    };

    // Pass all template config to preview
    const templateConfig = {
        ...formData,
        branding,
        tableColumns,
    };

    // Paper size dimensions for preview
    const getPaperDimensions = () => {
        const paperSizes: Record<string, { width: string; height: string }> = {
            'A4': { width: '210mm', height: '297mm' },
            'A5': { width: '148mm', height: '210mm' },
            'Letter': { width: '216mm', height: '279mm' },
        };
        const isLandscape = formData.orientation === 'Landscape';
        const paper = paperSizes[formData.paperSize] || paperSizes['A4'];
        return {
            width: isLandscape ? paper.height : paper.width,
            height: isLandscape ? paper.width : paper.height,
        };
    };

    // Map clicked elements to their sidebar tabs
    const ELEMENT_TO_TAB: Record<string, TemplateNavItem> = {
        // Header / Branding
        'logo': 'header',
        'invoice-title': 'header',
        'invoice-number': 'header',
        'bill-to-label': 'header',
        'bill-to-name': 'header',
        'bill-to-address': 'header',
        'invoice-date-label': 'header',
        'invoice-date-value': 'header',
        'due-date-label': 'header',
        'due-date-value': 'header',
        'terms-label': 'header',
        'terms-value': 'header',
        'footer': 'header',

        // Table (Middle)
        'table': 'table',
        'table-header': 'table',
        'table-body': 'table',
        'subtotal-label': 'table',
        'tax-label': 'table',
        'discount-row': 'table',
        'total-label': 'table',
        'previous-remaining': 'table',
        'balance-due': 'table',
        'notes-label': 'notes',

        // General (Left/Background) - Fallback or specific
        'background': 'general',
        'paper': 'general'
    };

    // Handle selection from preview
    const handlePreviewSelection = (elementId: string) => {
        handleSelectElement(elementId);

        // Switch to correct tab
        const targetNav = ELEMENT_TO_TAB[elementId];
        if (targetNav && targetNav !== activeNav) {
            setActiveNav(targetNav);
        }
    };

    const paperDims = getPaperDimensions();

    return (
        <div className="flex h-screen bg-white overflow-hidden">
            {/* --- Settings Panel (next to sidebar) --- */}
            <aside className="w-[320px] bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between shrink-0">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Template Properties</h2>
                </div>

                {/* Scrollable Settings Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* GENERAL TAB */}
                    {activeNav === 'general' && (
                        <>
                            {/* Template Name */}
                            <div className="px-4 py-4 border-b border-gray-200">
                                <label className="block text-xs font-medium text-blue-600 mb-1">Template Name*</label>
                                <input
                                    type="text"
                                    value={formData.templateName}
                                    onChange={(e) => handleChange('templateName', e.target.value)}
                                    placeholder="Standard Template"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
                                />
                            </div>

                            {/* Paper Size */}
                            <div className="px-4 py-4 border-b border-gray-200">
                                <label className="block text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                                    Paper Size
                                    <span className="w-4 h-4 bg-gray-200 rounded-full text-xs flex items-center justify-center text-gray-500">?</span>
                                </label>
                                <div className="flex gap-4">
                                    {['A5', 'A4', 'Letter'].map(size => (
                                        <label key={size} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="paperSize"
                                                value={size}
                                                checked={formData.paperSize === size}
                                                onChange={(e) => handleChange('paperSize', e.target.value)}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <span className="text-sm text-gray-800">{size}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Orientation */}
                            <div className="px-4 py-4 border-b border-gray-200">
                                <label className="block text-xs font-medium text-gray-700 mb-2">Orientation</label>
                                <div className="flex gap-6">
                                    {['Portrait', 'Landscape'].map(orientation => (
                                        <label key={orientation} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="orientation"
                                                value={orientation}
                                                checked={formData.orientation === orientation}
                                                onChange={(e) => handleChange('orientation', e.target.value)}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <span className="text-sm text-gray-800">{orientation}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Margins */}
                            <div className="px-4 py-4 border-b border-gray-200">
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Margins <span className="text-blue-600">(in inches)</span>
                                </label>
                                <div className="space-y-3">
                                    {(
                                        [
                                            { key: 'marginTop', label: 'Top' },
                                            { key: 'marginBottom', label: 'Bottom' },
                                            { key: 'marginLeft', label: 'Left' },
                                            { key: 'marginRight', label: 'Right' },
                                        ] as const
                                    ).map(({ key, label }) => (
                                        <div key={key}>
                                            <label className="text-xs text-gray-500 block mb-1">{label}</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={formData[key] as number}
                                                onChange={(e) => handleChange(key, parseFloat(e.target.value) || 0)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Include Payment Stub */}
                            <div className="px-4 py-4 border-b border-gray-200">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.showNotes}
                                        onChange={(e) => handleChange('showNotes', e.target.checked)}
                                        className="w-4 h-4 rounded text-blue-600"
                                    />
                                    <span className="text-sm text-gray-800">Include Payment Stub</span>
                                    <span className="w-4 h-4 bg-gray-200 rounded-full text-xs flex items-center justify-center text-gray-500">?</span>
                                </label>
                            </div>

                            {/* Font Section - Collapsible */}
                            <CollapsibleSection title="Font" defaultOpen={false}>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Font Family</label>
                                        <select
                                            value={formData.fontFamily || 'Helvetica'}
                                            onChange={(e) => handleChange('fontFamily', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
                                        >
                                            <optgroup label="Sans-Serif">
                                                <option value="Helvetica">Helvetica</option>
                                                <option value="Arial">Arial</option>
                                                <option value="Inter">Inter</option>
                                                <option value="Roboto">Roboto</option>
                                                <option value="Open Sans">Open Sans</option>
                                                <option value="Lato">Lato</option>
                                                <option value="Montserrat">Montserrat</option>
                                                <option value="Poppins">Poppins</option>
                                                <option value="Nunito">Nunito</option>
                                                <option value="Source Sans Pro">Source Sans Pro</option>
                                                <option value="Ubuntu">Ubuntu</option>
                                                <option value="Raleway">Raleway</option>
                                                <option value="Oswald">Oswald</option>
                                            </optgroup>
                                            <optgroup label="Serif">
                                                <option value="Times New Roman">Times New Roman</option>
                                                <option value="Georgia">Georgia</option>
                                                <option value="Merriweather">Merriweather</option>
                                                <option value="Playfair Display">Playfair Display</option>
                                                <option value="Lora">Lora</option>
                                                <option value="PT Serif">PT Serif</option>
                                                <option value="Crimson Text">Crimson Text</option>
                                            </optgroup>
                                            <optgroup label="Monospace">
                                                <option value="Courier New">Courier New</option>
                                                <option value="Fira Code">Fira Code</option>
                                                <option value="JetBrains Mono">JetBrains Mono</option>
                                                <option value="Source Code Pro">Source Code Pro</option>
                                            </optgroup>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Base Size (pt)</label>
                                        <input
                                            type="number"
                                            value={formData.fontSize}
                                            onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Heading Size (pt)</label>
                                        <input
                                            type="number"
                                            value={formData.headingFontSize}
                                            onChange={(e) => handleChange('headingFontSize', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
                                        />
                                    </div>
                                </div>
                            </CollapsibleSection>

                            {/* Background Section - Collapsible */}
                            <CollapsibleSection title="Background" defaultOpen={false}>
                                <div className="space-y-3">
                                    <ColorInput
                                        label="Page Background"
                                        value={formData.backgroundColor || '#ffffff'}
                                        onChange={(v) => handleChange('backgroundColor', v)}
                                    />
                                    <ColorInput
                                        label="Text Color"
                                        value={formData.textColor || '#1f2937'}
                                        onChange={(v) => handleChange('textColor', v)}
                                    />
                                </div>
                            </CollapsibleSection>
                        </>
                    )}

                    {/* HEADER/BRANDING TAB */}
                    {activeNav === 'header' && (
                        <>
                            {/* Logo Upload */}
                            <CollapsibleSection title="Logo" defaultOpen={selectedElement === 'logo'} id="section-logo">
                                <div className="space-y-4">
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {branding.logoPreview ? (
                                            <img src={branding.logoPreview} alt="Logo preview" className="max-h-16 mx-auto" />
                                        ) : (
                                            <>
                                                <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                                                <p className="text-sm text-gray-600">Click to upload logo</p>
                                            </>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={onLogoFileChange}
                                            className="hidden"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs text-gray-600 mb-1 block">Brand Name</label>
                                            <input
                                                type="text"
                                                value={branding.brandName}
                                                onChange={(e) => setBrandName(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-600 mb-1 block">Tagline</label>
                                            <input
                                                type="text"
                                                value={branding.tagline}
                                                onChange={(e) => setTagline(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CollapsibleSection>

                            {/* Invoice Title Customization */}
                            <CollapsibleSection title="Invoice Title" defaultOpen={selectedElement === 'invoice-title'} id="section-invoice-title">
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Title Text</label>
                                        <input
                                            type="text"
                                            value={formData.invoiceLabel}
                                            onChange={(e) => handleChange('invoiceLabel', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
                                        />
                                    </div>
                                    <ColorInput label="Title Color" value={formData.primaryColor} onChange={(v) => handleChange('primaryColor', v)} />
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Title Size (pt)</label>
                                        <input
                                            type="number"
                                            value={formData.headingFontSize}
                                            onChange={(e) => handleChange('headingFontSize', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
                                        />
                                    </div>
                                </div>
                            </CollapsibleSection>

                            {/* Invoice Number Customization */}
                            <CollapsibleSection title="Invoice Number" defaultOpen={selectedElement === 'invoice-number'} id="section-invoice-number">
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Number Label</label>
                                        <input
                                            type="text"
                                            value={formData.invoiceNumberLabel}
                                            onChange={(e) => handleChange('invoiceNumberLabel', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
                                        />
                                    </div>
                                    <ColorInput label="Number Color" value={formData.invoiceNumberColor || '#075056'} onChange={(v) => handleChange('invoiceNumberColor', v)} />
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Number Size (pt)</label>
                                        <input
                                            type="number"
                                            value={formData.subheadingFontSize}
                                            onChange={(e) => handleChange('subheadingFontSize', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
                                        />
                                    </div>
                                </div>
                            </CollapsibleSection>

                            {/* Header/Footer Toggles */}
                            <div className="px-4 py-4 border-b border-gray-200 space-y-2">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={formData.showHeader} onChange={(e) => handleChange('showHeader', e.target.checked)} className="rounded text-blue-600" />
                                    <span className="text-sm text-gray-700">Show Header</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={formData.showFooter} onChange={(e) => handleChange('showFooter', e.target.checked)} className="rounded text-blue-600" />
                                    <span className="text-sm text-gray-700">Show Footer</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={formData.showLogo} onChange={(e) => handleChange('showLogo', e.target.checked)} className="rounded text-blue-600" />
                                    <span className="text-sm text-gray-700">Show Logo</span>
                                </label>
                            </div>

                            {/* Bill To Label (Header) */}
                            <CollapsibleSection title="Bill To Label" defaultOpen={selectedElement === 'bill-to-label'} id="section-bill-to-label">
                                <LabelStyleEditor
                                    label="Bill To Label"
                                    textValue={formData.billToLabel}
                                    textColor={formData.textColor}
                                    fontSize={formData.labelFontSize}
                                    onTextChange={(v) => handleChange('billToLabel', v)}
                                    onTextColorChange={(v) => handleChange('textColor', v)}
                                    onFontSizeChange={(v) => handleChange('labelFontSize', v)}
                                    showBg={false}
                                />
                            </CollapsibleSection>

                            {/* Bill To Name Style */}
                            <CollapsibleSection title="Bill To Name" defaultOpen={selectedElement === 'bill-to-name'} id="section-bill-to-name">
                                <div className="space-y-3">
                                    <ColorInput label="Name Color" value={formData.billToNameColor || '#075056'} onChange={(v) => handleChange('billToNameColor', v)} />
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Name Size (pt)</label>
                                        <input
                                            type="number"
                                            value={formData.billToNameFontSize}
                                            onChange={(e) => handleChange('billToNameFontSize', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
                                        />
                                    </div>
                                </div>
                            </CollapsibleSection>

                            {/* Bill To Address Style */}
                            <CollapsibleSection title="Bill To Address" defaultOpen={selectedElement === 'bill-to-address'} id="section-bill-to-address">
                                <div className="space-y-3">
                                    <ColorInput label="Address Color" value={formData.billToAddressColor || '#075056'} onChange={(v) => handleChange('billToAddressColor', v)} />
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Address Size (pt)</label>
                                        <input
                                            type="number"
                                            value={formData.billToAddressFontSize}
                                            onChange={(e) => handleChange('billToAddressFontSize', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
                                        />
                                    </div>
                                </div>
                            </CollapsibleSection>

                            {/* Invoice Details Labels */}
                            <CollapsibleSection title="Invoice Date" defaultOpen={selectedElement === 'invoice-date-label' || selectedElement === 'invoice-date-value'} id="section-invoice-date">
                                <div className="space-y-4">
                                    <div className="border-b pb-2">
                                        <p className="text-xs font-bold text-gray-500 mb-2">Label Style</p>
                                        <LabelStyleEditor
                                            label="Label"
                                            textValue={formData.invoiceDateLabel}
                                            textColor={formData.invoiceDateLabelColor}
                                            fontSize={formData.invoiceDetailLabelFontSize}
                                            onTextChange={(v) => handleChange('invoiceDateLabel', v)}
                                            onTextColorChange={(v) => handleChange('invoiceDateLabelColor', v)}
                                            onFontSizeChange={(v) => handleChange('invoiceDetailLabelFontSize', v)}
                                            showBg={false}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 mb-2">Value Style</p>
                                        <div className="space-y-2">
                                            <ColorInput label="Value Color" value={formData.invoiceDateValueColor || '#1f2937'} onChange={(v) => handleChange('invoiceDateValueColor', v)} />
                                            <div>
                                                <label className="text-xs text-gray-600 mb-1 block">Value Size (pt)</label>
                                                <input
                                                    type="number"
                                                    value={formData.invoiceDetailValueFontSize}
                                                    onChange={(e) => handleChange('invoiceDetailValueFontSize', parseInt(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CollapsibleSection>

                            <CollapsibleSection title="Due Date" defaultOpen={selectedElement === 'due-date-label' || selectedElement === 'due-date-value'} id="section-due-date">
                                <div className="space-y-4">
                                    <div className="border-b pb-2">
                                        <p className="text-xs font-bold text-gray-500 mb-2">Label Style</p>
                                        <LabelStyleEditor
                                            label="Label"
                                            textValue={formData.dueDateLabel}
                                            textColor={formData.dueDateLabelColor}
                                            fontSize={formData.invoiceDetailLabelFontSize}
                                            onTextChange={(v) => handleChange('dueDateLabel', v)}
                                            onTextColorChange={(v) => handleChange('dueDateLabelColor', v)}
                                            onFontSizeChange={(v) => handleChange('invoiceDetailLabelFontSize', v)}
                                            showBg={false}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 mb-2">Value Style</p>
                                        <div className="space-y-2">
                                            <ColorInput label="Value Color" value={formData.dueDateValueColor || '#1f2937'} onChange={(v) => handleChange('dueDateValueColor', v)} />
                                            <div className="text-xs text-gray-400 italic">Uses shared Value Size</div>
                                            {/* Optional: Add separate font size if needed later, using shared for now to avoid clutter */}
                                        </div>
                                    </div>
                                </div>
                            </CollapsibleSection>

                            <CollapsibleSection title="Terms" defaultOpen={selectedElement === 'terms-label' || selectedElement === 'terms-value'} id="section-terms-date">
                                <div className="space-y-4">
                                    <div className="border-b pb-2">
                                        <p className="text-xs font-bold text-gray-500 mb-2">Label Style</p>
                                        <LabelStyleEditor
                                            label="Label"
                                            textValue={formData.termsLabel}
                                            textColor={formData.termsLabelColor}
                                            fontSize={formData.invoiceDetailLabelFontSize}
                                            onTextChange={(v) => handleChange('termsLabel', v)}
                                            onTextColorChange={(v) => handleChange('termsLabelColor', v)}
                                            onFontSizeChange={(v) => handleChange('invoiceDetailLabelFontSize', v)}
                                            showBg={false}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 mb-2">Value Style</p>
                                        <div className="space-y-2">
                                            <ColorInput label="Value Color" value={formData.termsValueColor || '#1f2937'} onChange={(v) => handleChange('termsValueColor', v)} />
                                            <div className="text-xs text-gray-400 italic">Uses shared Value Size</div>
                                        </div>
                                    </div>
                                </div>
                            </CollapsibleSection>

                            {/* Footer Text */}
                            <CollapsibleSection title="Footer Settings" defaultOpen={selectedElement === 'footer'} id="section-footer">
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Footer Text</label>
                                        <input
                                            type="text"
                                            value={formData.footerText || ''}
                                            onChange={(e) => handleChange('footerText', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
                                        />
                                    </div>
                                    <ColorInput
                                        label="Footer Background"
                                        value={formData.footerBackgroundColor || '#f9fafb'}
                                        onChange={(v) => handleChange('footerBackgroundColor', v)}
                                    />
                                </div>
                            </CollapsibleSection>
                        </>
                    )}

                    {/* TABLE TAB */}
                    {activeNav === 'table' && (
                        <>
                            {/* Add Column Button */}
                            <div className="px-4 py-3 border-b border-gray-200">
                                <button
                                    onClick={addColumn}
                                    className="flex items-center gap-2 w-full py-2 px-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                    <Plus size={16} />
                                    <span className="text-sm font-medium">Add Column</span>
                                </button>
                            </div>

                            {/* Column List */}
                            <div className="px-4 py-3 space-y-2">
                                {tableColumns.map((col, idx) => (
                                    <div
                                        key={col.key}
                                        className={`border rounded-lg p-3 ${col.enabled ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <GripVertical size={14} className="text-gray-400 cursor-move" />
                                            <input
                                                type="checkbox"
                                                checked={col.enabled}
                                                onChange={() => toggleColumn(idx)}
                                                className="rounded text-blue-600"
                                            />
                                            <span className="text-xs text-gray-600 font-mono bg-gray-100 px-1.5 py-0.5 rounded">{col.key}</span>
                                            {!['index', 'itemName', 'description', 'quantity', 'rate', 'amount'].includes(col.key) && (
                                                <button onClick={() => removeColumn(idx)} className="ml-auto text-red-500 hover:bg-red-50 p-1 rounded">
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <label className="text-xs text-gray-500">Label</label>
                                                <input
                                                    type="text"
                                                    value={col.label}
                                                    onChange={(e) => handleColumnChange(idx, 'label', e.target.value)}
                                                    disabled={!col.enabled}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-800"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">Width</label>
                                                <input
                                                    type="number"
                                                    value={col.width}
                                                    onChange={(e) => handleColumnChange(idx, 'width', parseInt(e.target.value) || 50)}
                                                    disabled={!col.enabled}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-800"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">Align</label>
                                                <select
                                                    value={col.align}
                                                    onChange={(e) => handleColumnChange(idx, 'align', e.target.value)}
                                                    disabled={!col.enabled}
                                                    className="w-full px-1 py-1 border border-gray-300 rounded text-xs text-gray-800"
                                                >
                                                    <option value="left">Left</option>
                                                    <option value="center">Center</option>
                                                    <option value="right">Right</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>


                            {/* Table Header Style */}
                            <CollapsibleSection title="Table Header Style" defaultOpen={selectedElement === 'table-header'} id="section-table-header">
                                <div className="space-y-3">
                                    <ColorInput label="Background" value={formData.tableHeaderBgColor || '#FF9608'} onChange={(v) => handleChange('tableHeaderBgColor', v)} />
                                    <ColorInput label="Text Color" value={formData.tableHeaderTextColor || '#ffffff'} onChange={(v) => handleChange('tableHeaderTextColor', v)} />
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Font Size (pt)</label>
                                        <input
                                            type="number"
                                            value={formData.tableFontSize}
                                            onChange={(e) => handleChange('tableFontSize', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
                                        />
                                    </div>
                                    <ColorInput label="Row Color" value={formData.tableRowColor || '#fffbeb'} onChange={(v) => handleChange('tableRowColor', v)} />
                                </div>
                            </CollapsibleSection>

                            {/* Table Body Style */}
                            <CollapsibleSection title="Table Body Style" defaultOpen={selectedElement === 'table-body'} id="section-table-body">
                                <div className="space-y-3">
                                    <ColorInput label="Body Text" value={formData.textColor || '#1f2937'} onChange={(v) => handleChange('textColor', v)} />
                                    <ColorInput label="Body Background" value={formData.tableRowColor || '#fffbeb'} onChange={(v) => handleChange('tableRowColor', v)} />
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Body Font (pt)</label>
                                        <input
                                            type="number"
                                            value={formData.tableFontSize}
                                            onChange={(e) => handleChange('tableFontSize', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
                                        />
                                    </div>
                                    <ColorInput label="Alt Row Color" value={formData.tableAltRowColor || '#ffffff'} onChange={(v) => handleChange('tableAltRowColor', v)} />
                                </div>
                            </CollapsibleSection>

                            {/* Table Options */}
                            <div className="px-4 py-4 space-y-2">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={formData.showTableHeader} onChange={(e) => handleChange('showTableHeader', e.target.checked)} className="rounded text-blue-600" />
                                    <span className="text-sm text-gray-700">Show Table Header</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={formData.alternateRowColors} onChange={(e) => handleChange('alternateRowColors', e.target.checked)} className="rounded text-blue-600" />
                                    <span className="text-sm text-gray-700">Alternate Row Colors</span>
                                </label>
                            </div>
                        </>
                    )}

                    {/* TOTAL TAB */}
                    {activeNav === 'total' && (
                        <>


                            {/* Subtotal Label */}
                            <CollapsibleSection title="Subtotal Label" defaultOpen={selectedElement === 'subtotal-label'} id="section-subtotal-label">
                                <LabelStyleEditor
                                    label="Subtotal"
                                    textValue={formData.subtotalLabel}
                                    textColor={formData.textColor}
                                    fontSize={formData.labelFontSize}
                                    onTextChange={(v) => handleChange('subtotalLabel', v)}
                                    onTextColorChange={(v) => handleChange('textColor', v)}
                                    onFontSizeChange={(v) => handleChange('labelFontSize', v)}
                                    showBg={false}
                                />
                            </CollapsibleSection>

                            {/* Tax Label */}
                            <CollapsibleSection title="Tax Label" defaultOpen={selectedElement === 'tax-label'} id="section-tax-label">
                                <LabelStyleEditor
                                    label="Tax"
                                    textValue={formData.taxLabel}
                                    textColor={formData.textColor}
                                    fontSize={formData.labelFontSize}
                                    onTextChange={(v) => handleChange('taxLabel', v)}
                                    onTextColorChange={(v) => handleChange('textColor', v)}
                                    onFontSizeChange={(v) => handleChange('labelFontSize', v)}
                                    showBg={false}
                                />
                            </CollapsibleSection>

                            {/* Previous Remaining Label */}
                            <CollapsibleSection title="Previous Remaining" defaultOpen={selectedElement === 'previous-remaining'} id="section-previous-remaining">
                                <LabelStyleEditor
                                    label="Previous Remaining"
                                    textValue={formData.previousDueLabel}
                                    textColor={formData.secondaryColor}
                                    fontSize={formData.labelFontSize}
                                    onTextChange={(v) => handleChange('previousDueLabel', v)}
                                    onTextColorChange={(v) => handleChange('secondaryColor', v)}
                                    onFontSizeChange={(v) => handleChange('labelFontSize', v)}
                                    showBg={false}
                                />
                            </CollapsibleSection>

                            {/* Total Label */}
                            <CollapsibleSection title="Total Label" defaultOpen={selectedElement === 'total-label'} id="section-total-label">
                                <LabelStyleEditor
                                    label="Total"
                                    textValue={formData.totalLabel}
                                    textColor="#EE5858"
                                    fontSize={formData.labelFontSize}
                                    onTextChange={(v) => handleChange('totalLabel', v)}
                                    onTextColorChange={(v) => handleChange('accentColor', v)}
                                    onFontSizeChange={(v) => handleChange('labelFontSize', v)}
                                    showBg={false}
                                />
                            </CollapsibleSection>

                            {/* Balance Due Label */}
                            <CollapsibleSection title="Balance Due Style" defaultOpen={selectedElement === 'balance-due'} id="section-balance-due">
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Label Text</label>
                                        <input
                                            type="text"
                                            value={formData.balanceDueLabel}
                                            onChange={(e) => handleChange('balanceDueLabel', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
                                        />
                                    </div>
                                    <ColorInput label="Text Color" value={formData.balanceDueTextColor || '#EE5858'} onChange={(v) => handleChange('balanceDueTextColor', v)} />
                                    <ColorInput label="Box Background" value={formData.accentColor || '#FBBF24'} onChange={(v) => handleChange('accentColor', v)} />
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Font Size (pt)</label>
                                        <input
                                            type="number"
                                            value={formData.labelFontSize}
                                            onChange={(e) => handleChange('labelFontSize', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800"
                                        />
                                    </div>
                                </div>
                            </CollapsibleSection>

                            {/* Visibility Options moved to bottom */}
                            <div className="px-4 py-4 border-b border-gray-200 space-y-2">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={formData.showSubtotal} onChange={(e) => handleChange('showSubtotal', e.target.checked)} className="rounded text-blue-600" />
                                    <span className="text-sm text-gray-700">Show Subtotal</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={formData.showTax} onChange={(e) => handleChange('showTax', e.target.checked)} className="rounded text-blue-600" />
                                    <span className="text-sm text-gray-700">Show Tax</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={formData.showDiscount} onChange={(e) => handleChange('showDiscount', e.target.checked)} className="rounded text-blue-600" />
                                    <span className="text-sm text-gray-700">Show Discount</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={formData.showPreviousDue} onChange={(e) => handleChange('showPreviousDue', e.target.checked)} className="rounded text-blue-600" />
                                    <span className="text-sm text-gray-700">Show Previous Remaining</span>
                                </label>
                            </div>
                        </>
                    )}

                    {/* NOTES TAB */}
                    {activeNav === 'notes' && (
                        <>
                            {/* Visibility */}


                            {/* Notes Label Styling */}
                            <CollapsibleSection title="Notes Label" defaultOpen={selectedElement === 'notes-label'} id="section-notes-label">
                                <LabelStyleEditor
                                    label="Notes"
                                    textValue={formData.notesLabel}
                                    textColor={formData.textColor}
                                    fontSize={formData.labelFontSize}
                                    onTextChange={(v) => handleChange('notesLabel', v)}
                                    onTextColorChange={(v) => handleChange('textColor', v)}
                                    onFontSizeChange={(v) => handleChange('labelFontSize', v)}
                                    showBg={false}
                                />
                            </CollapsibleSection>

                            {/* Bill To & Terms Labels */}


                            {/* Global Font Sizes */}
                            <CollapsibleSection title="Font Sizes" defaultOpen={false}>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Base Font (pt)</label>
                                        <input type="number" value={formData.fontSize} onChange={(e) => handleChange('fontSize', parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Label Font (pt)</label>
                                        <input type="number" value={formData.labelFontSize} onChange={(e) => handleChange('labelFontSize', parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800" />
                                    </div>
                                </div>
                            </CollapsibleSection>

                            {/* Visibility - Moved to bottom */}
                            <div className="px-4 py-4 border-b border-gray-200 space-y-2">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Visibility</h4>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={formData.showNotes} onChange={(e) => handleChange('showNotes', e.target.checked)} className="rounded text-blue-600" />
                                    <span className="text-sm text-gray-700">Show Notes Section</span>
                                </label>
                            </div>
                        </>
                    )}
                </div>

                {/* Save Button at bottom */}
                <div className="p-4 border-t border-gray-200 shrink-0">
                    <Button
                        onClick={() => handleSubmit(false)}
                        loading={loading}
                        variant="primary"
                        className="w-full bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Save Template
                    </Button>
                </div>
            </aside>

            {/* Preview Area - Full Width */}
            <main className="flex-1 bg-gray-100 overflow-auto flex justify-center items-start p-4">
                <div
                    className="transition-all duration-300 shadow-2xl bg-white flex flex-col"
                    style={{
                        width: '100%',
                        maxWidth: paperDims.width,
                        minHeight: paperDims.height,
                    }}
                >
                    <TemplatePreview
                        data={templateConfig}
                        selectedElement={selectedElement}
                        onSelectElement={handlePreviewSelection}
                    />
                </div>
            </main>

            {/* Alert Toast */}
            {alert.show && (
                <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-md shadow-lg flex items-center gap-3 ${alert.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                    alert.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                        'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}>
                    <span>{alert.message}</span>
                    <button onClick={dismissAlert} className="text-sm font-semibold hover:underline">Dismiss</button>
                </div>
            )}
        </div>
    );
};

export default TemplateForm;
