import React from 'react';
// Table column type
interface TableColumn {
    key: string;
    label: string;
    width: number;
    align: 'left' | 'center' | 'right';
    enabled: boolean;
}

interface InvoiceItem {
    index: number;
    itemName: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
}

interface TemplateBranding {
    brandName?: string;
    tagline?: string;
    logoPreview?: string;
}

interface TableColumnSetting {
    columnName?: string;
    key?: string;
    label?: string;
    width?: string | number;
    alignment?: 'left' | 'center' | 'right';
    visible?: boolean;
}

interface TemplateData {
    // Colors
    primaryColor?: string;
    accentColor?: string;
    secondaryColor?: string;
    invoiceNumberColor?: string;
    billToColor?: string;
    previousDueColor?: string;
    textColor?: string;
    footerBackgroundColor?: string;
    borderColor?: string;
    tableHeaderBgColor?: string;
    tableHeaderTextColor?: string;
    tableRowColor?: string;
    invoiceDateLabelColor?: string;
    invoiceDateValueColor?: string;
    termsLabelColor?: string;
    termsValueColor?: string;
    dueDateLabelColor?: string;
    dueDateValueColor?: string;
    billToNameColor?: string;
    billToAddressColor?: string;

    // Branding
    branding?: TemplateBranding;
    brandName?: string;
    tagline?: string;
    logoUrl?: string;
    showLogo?: boolean;

    // Fonts & Text Sizes
    fontFamily?: string;
    fontSize?: number | string;
    headingFontSize?: number | string;
    subheadingFontSize?: number | string;
    labelFontSize?: number | string;
    invoiceDetailLabelFontSize?: number | string;
    invoiceDetailValueFontSize?: number | string;
    billToNameFontSize?: number | string;
    billToAddressFontSize?: number | string;
    tableFontSize?: number | string;
    footerFontSize?: number | string;

    // Labels
    invoiceLabel?: string;
    billToLabel?: string;
    invoiceDateLabel?: string;
    termsLabel?: string;
    dueDateLabel?: string;
    subtotalLabel?: string;
    taxLabel?: string;
    discountLabel?: string;
    previousDueLabel?: string;
    totalLabel?: string;
    balanceDueLabel?: string;
    notesLabel?: string;
    footerText?: string;

    // Visibility toggles
    showInvoiceDate?: boolean;
    showDueDate?: boolean;
    showTableHeader?: boolean;
    alternateRowColors?: boolean;
    showSubtotal?: boolean;
    showTax?: boolean;
    showDiscount?: boolean;
    showPreviousDue?: boolean;
    showTotal?: boolean; // Added control for Total text line
    showNotes?: boolean;
    showFooter?: boolean;

    // Layout
    marginTop?: number;
    marginRight?: number;
    marginLeft?: number;
    paperSize?: string;
    orientation?: string;
    backgroundColor?: string;

    // Tables
    tableColumns?: TableColumn[];
    tableColumnSettings?: TableColumnSetting[];
}

interface InvoiceItemData {
    title?: string;
    description?: string;
    quantity?: number | string;
    rate?: number | string;
    amount?: number | string;
    name?: string;
    item?: { name?: string };
    [key: string]: any; // Allow custom keys
}

interface CustomerData {
    displayName?: string;
    companyName?: string;
    address?: string;
}

interface InvoiceData {
    invoiceNumber?: string;
    invoiceDate?: string | Date;
    dueDate?: string | Date;
    formattedDueDate?: string; // Bypass date formatting
    terms?: string; // Direct terms string
    customerDisplayName?: string;
    customerId?: CustomerData;
    customer?: CustomerData;
    customerAddress?: string;
    items?: InvoiceItemData[];
    subTotal?: number | string;
    subtotal?: number | string;
    previousRemaining?: number | string;
    remaining?: number | string;
    total?: number | string;
    currency?: string;
    notes?: string;
}

interface TemplatePreviewProps {
    data: TemplateData;
    invoice?: InvoiceData; // Added invoice prop
    selectedElement?: string;
    onSelectElement?: (element: string) => void;
    style?: React.CSSProperties;
    className?: string;
    footerStyle?: React.CSSProperties;
}

// Clickable wrapper component for selectable elements
const SelectableElement: React.FC<{
    id: string;
    selectedElement?: string;
    onSelect?: (id: string) => void;
    children: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
}> = ({ id, selectedElement, onSelect, children, style, className }) => {
    const isSelected = selectedElement === id;

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                onSelect?.(id);
            }}
            className={`cursor-pointer transition-all duration-150 rounded-sm ${isSelected ? 'outline-2 outline-blue-500 outline-offset-2' : ''} ${className || ''}`}
            style={style}
            title={`Click to edit ${id}`}
        >
            {children}
        </div>
    );
};

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ data, invoice, selectedElement, onSelectElement, style, className, footerStyle }) => {
    // Helper to validate color values from DB (which might be corrupt like '#' or invalid hex)
    const isValidColor = (color: unknown): color is string => {
        if (!color || typeof color !== 'string') return false;
        if (color === '#') return false;
        // Basic hex check (3, 6, or 8 digits)
        return /^#([0-9A-F]{3}){1,2}([0-9A-F]{2})?$/i.test(color);
    };

    // Safe color getters
    const getColor = (val: string | undefined, defaultVal: string): string => {
        return isValidColor(val) ? val : defaultVal;
    };

    // Colors from template config - using safe getters
    const primaryColor = getColor(data.primaryColor, '#FF9608');
    const accentColor = getColor(data.accentColor, '#FBBF24');
    const secondaryColor = getColor(data.secondaryColor, '#075056');
    const invoiceNumberColor = getColor(data.invoiceNumberColor, secondaryColor);
    const billToColor = getColor(data.billToColor, secondaryColor);
    const previousDueColor = getColor(data.previousDueColor, secondaryColor);
    const grayText = '#6b7280';
    const darkText = getColor(data.textColor, '#1f2937');
    const redText = '#EE5858';
    const lightGrayBg = getColor(data.footerBackgroundColor, '#f9fafb');
    const grayBorder = getColor(data.borderColor, '#e5e7eb');

    // Branding from template config
    // Check both branding.logoPreview (from hook during editing) and data.logoUrl (saved template)
    const branding = data.branding || {
        brandName: data.brandName || 'revolutic',
        tagline: data.tagline || 'digital innovation leadership',
        logoPreview: data.logoUrl ? `/${data.logoUrl.replace(/^\//, '')}` : ''
    };

    // If branding doesn't have logoPreview but data has logoUrl, set it
    if (!branding.logoPreview && data.logoUrl) {
        branding.logoPreview = `/${data.logoUrl.replace(/^\//, '')}`;
    }
    const DEFAULT_COLUMNS: TableColumn[] = [
        { key: 'index', label: '#', width: 30, align: 'left', enabled: true },
        { key: 'itemName', label: 'Item & Description', width: 200, align: 'left', enabled: true },
        { key: 'quantity', label: 'Qty', width: 50, align: 'center', enabled: true },
        { key: 'rate', label: 'Rate', width: 60, align: 'right', enabled: true },
        { key: 'amount', label: 'Amount', width: 70, align: 'right', enabled: true },
    ];

    const getTableColumns = (): TableColumn[] => {
        if (data.tableColumns) return data.tableColumns;

        const settings = data.tableColumnSettings;
        if (settings && Array.isArray(settings) && settings.length > 0) {
            // Merge saved settings with defaults
            const merged = DEFAULT_COLUMNS.map(defCol => {
                const saved = settings.find((c: TableColumnSetting) => {
                    const key = c.columnName || c.key;
                    // Check direct match or normalized match
                    if (key === defCol.key) return true;
                    if (defCol.key === 'itemName' && (key === 'name' || key === 'item' || key === 'description')) return true;
                    return false;
                });
                if (saved) {
                    return {
                        ...defCol,
                        label: saved.label || defCol.label,
                        width: typeof saved.width === 'string' ? parseInt(saved.width) || defCol.width : (saved.width as number) || defCol.width,
                        align: saved.alignment || defCol.align,
                        enabled: saved.visible !== false
                    };
                }
                // If not in DB settings (which only saves enabled ones), it is disabled
                return { ...defCol, enabled: false };
            });

            // Add custom columns
            const custom = settings
                .filter((c: TableColumnSetting) => {
                    const key = c.columnName || c.key;
                    // Normalize common variations to prevent duplicates
                    const normalizedKey = (key === 'name' || key === 'item' || key === 'description') ? 'itemName' : key;
                    return !DEFAULT_COLUMNS.find(d => d.key === key || d.key === normalizedKey);
                })
                .map((c: TableColumnSetting) => ({
                    key: c.columnName || c.key || `col-${Math.random()}`,
                    label: c.label || 'Custom Column',
                    width: typeof c.width === 'string' ? parseInt(c.width) || 100 : (c.width as number) || 100,
                    align: c.alignment || 'left',
                    enabled: c.visible !== false
                }));

            return [...merged, ...custom];
        }

        return DEFAULT_COLUMNS;
    };

    const tableColumns = getTableColumns();

    const enabledColumns = tableColumns.filter(col => col.enabled);

    // Use provided invoice data or fallback to mock data
    const activeInvoice = invoice ? {
        number: invoice.invoiceNumber,
        date: new Date(invoice.invoiceDate || new Date()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        dueDate: invoice.formattedDueDate || (invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'),
        terms: invoice.terms || (() => {
            if (!invoice.dueDate || !invoice.invoiceDate) return 'Due on Receipt';
            const daysDiff = Math.floor((new Date(invoice.dueDate).getTime() - new Date(invoice.invoiceDate).getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff === 15) return 'Net 15';
            if (daysDiff === 30) return 'Net 30';
            if (daysDiff === 60) return 'Net 60';
            return 'Due on Receipt';
        })(),
        client: {
            name: invoice.customerDisplayName || invoice.customerId?.displayName || invoice.customerId?.companyName || invoice.customer?.displayName || invoice.customer?.companyName || 'Customer',
            address: invoice.customerAddress || invoice.customerId?.address || invoice.customer?.address || '',
        },
        items: (invoice.items || []).map((item: any, index: number) => ({
            ...item,
            index: index + 1,
            // Fallback for item name: title -> nested item name -> direct name -> empty
            itemName: item.title || item.item?.name || item.name || '',
            description: item.description || '',
            quantity: Number(item.quantity) || 0,
            rate: Number(item.rate) || 0,
            amount: Number(item.amount) || 0,
        })),
        subtotal: Number(invoice.subTotal || invoice.subtotal || 0),
        previousRemaining: Number(invoice.previousRemaining || 0),
        total: invoice.remaining !== undefined
            ? Number(invoice.remaining)
            : (Number(invoice.total || 0) + Number(invoice.previousRemaining || 0)),
        currency: invoice.currency || 'PKR',
        notes: invoice.notes || ''
    } : {
        number: 'INV-0000005',
        date: 'Dec 15, 2025',
        dueDate: 'Feb 13, 2026',
        terms: 'Net 60',
        client: {
            // ... (mock data omitted for brevity in replacement argument, I'm targeting the block above up to notes)
            name: 'Ali House',
            address: 'Chak118n.b',
        },
        items: [
            { index: 1, itemName: 'cloudcall', description: 'Consultation', quantity: 8.00, rate: 19, amount: 152.00 },
        ],
        subtotal: 1216.00,
        previousRemaining: 0.00,
        total: 152.00,
        currency: 'USD',
        notes: `Thanks for your business.`
    };

    const formatCurrency = (amount: number): string => {
        return `${amount.toFixed(2)} ${activeInvoice.currency}`;
    };

    const getCellValue = (item: any, key: string): string | number => {
        switch (key) {
            case 'index': return item.index;
            case 'itemName': return item.itemName;
            case 'description': return item.description;
            case 'quantity': return Number(item.quantity).toFixed(2);
            case 'rate': return item.rate;
            case 'amount': return Number(item.amount).toFixed(2);
            default: return item[key] || '';
        }
    };

    // Margins in inches converted to pixels (72 DPI)
    const marginTop = (data.marginTop || 0.5) * 72;
    const marginRight = (data.marginRight || 0.4) * 72;
    const marginLeft = (data.marginLeft || 0.4) * 72;

    // Paper dimensions for min-height
    const paperSizes: Record<string, { width: string; height: string }> = {
        'A4': { width: '210mm', height: '296mm' },
        'A5': { width: '148mm', height: '209mm' },
        'Letter': { width: '216mm', height: '278mm' },
    };
    const paperSize = data.paperSize || 'A4';
    const orientation = data.orientation || 'Portrait';
    const isLandscape = orientation === 'Landscape';
    const paper = paperSizes[paperSize] || paperSizes['A4'];
    const minHeight = isLandscape ? paper.width : paper.height;

    return (
        <div
            onClick={() => onSelectElement?.('')}
            className={`w-full flex flex-col ${className || ''}`}
            style={{
                backgroundColor: data.backgroundColor || '#ffffff',
                fontFamily: data.fontFamily || 'Helvetica, Arial, sans-serif',
                fontSize: `${data.fontSize || 10}pt`,
                color: darkText,
                minHeight: minHeight,
                ...style,
            }}
        >
            {/* Main Content Area - flex-grow to push footer down */}
            <div
                className="flex-grow flex flex-col"
                style={{
                    padding: `${marginTop}px ${marginRight}px 20px ${marginLeft}px`,
                }}
            >
                {/* Header - Logo Left, INVOICE Right */}
                <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
                    {/* Logo / Brand - Clickable */}
                    <SelectableElement
                        id="logo"
                        selectedElement={selectedElement}
                        onSelect={onSelectElement}
                    >
                        {data.showLogo !== false && (
                            branding.logoPreview ? (
                                <img id="logo-preview" src={branding.logoPreview} alt="Logo" className="max-w-[180px] max-h-[60px]" />
                            ) : (
                                <div id="logo-placeholder">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-10 h-10 rounded flex items-center justify-center text-white font-bold text-lg"
                                            style={{
                                                backgroundColor: secondaryColor,
                                            }}
                                        >
                                            R
                                        </div>
                                        <span style={{
                                            fontSize: `${data.headingFontSize || 24}pt`,
                                            fontWeight: 'bold',
                                            color: darkText,
                                            letterSpacing: '-0.5px'
                                        }}>
                                            {branding.brandName || 'revolutic'}
                                        </span>
                                    </div>
                                    <div style={{
                                        fontSize: '9pt',
                                        color: primaryColor,
                                        marginTop: '2px',
                                        marginLeft: '40px'
                                    }}>
                                        {branding.tagline || 'digital innovation leadership'}
                                    </div>
                                </div>
                            )
                        )}
                    </SelectableElement>

                    {/* INVOICE Title - Clickable */}
                    <div className="flex flex-col items-end">
                        <SelectableElement
                            id="invoice-title"
                            selectedElement={selectedElement}
                            onSelect={onSelectElement}
                            style={{ textAlign: 'right' }}
                        >
                            <h1 style={{
                                fontSize: `${data.headingFontSize || 28}pt`,
                                fontWeight: 'bold',
                                color: invoiceNumberColor,
                                margin: 0,
                                letterSpacing: '1px'
                            }}>
                                {data.invoiceLabel || 'INVOICE'}
                            </h1>
                        </SelectableElement>
                        <SelectableElement
                            id="invoice-number"
                            selectedElement={selectedElement}
                            onSelect={onSelectElement}
                            style={{ textAlign: 'right' }}
                        >
                            <p style={{
                                margin: '4px 0 0 0',
                                fontSize: `${data.subheadingFontSize || 11}pt`,
                                color: invoiceNumberColor,
                                fontWeight: 600
                            }}>
                                {activeInvoice.number}
                            </p>
                        </SelectableElement>
                    </div>
                </div>

                <div className="flex flex-col" style={{ marginBottom: '32px' }}>

                    {/* Row 1: Bill To Label vs Invoice Date */}
                    <div className="flex justify-between items-start mb-2">
                        {/* Left: Bill To Label */}
                        <SelectableElement
                            id="bill-to-label"
                            selectedElement={selectedElement}
                            onSelect={onSelectElement}
                        >
                            <h3
                                className="font-bold m-0"
                                style={{
                                    fontSize: `${data.labelFontSize || 12}pt`,
                                    color: darkText,
                                }}
                            >
                                {data.billToLabel || 'Bill To'}
                            </h3>
                        </SelectableElement>

                        {/* Right: Invoice Date */}
                        <div className="flex flex-col items-end min-w-[220px]">
                            {data.showInvoiceDate !== false && (
                                <div className="flex justify-between items-center w-full gap-4">
                                    <SelectableElement id="invoice-date-label" selectedElement={selectedElement} onSelect={onSelectElement}>
                                        <span style={{ fontSize: `${data.invoiceDetailLabelFontSize || 10}pt`, color: data.invoiceDateLabelColor || grayText }}>{data.invoiceDateLabel || 'Invoice Date'} :</span>
                                    </SelectableElement>
                                    <SelectableElement id="invoice-date-value" selectedElement={selectedElement} onSelect={onSelectElement}>
                                        <span style={{ fontSize: `${data.invoiceDetailValueFontSize || 10}pt`, fontWeight: 'bold', color: data.invoiceDateValueColor || darkText }}>{activeInvoice.date}</span>
                                    </SelectableElement>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Row 2: Customer Name vs Terms */}
                    <div className="flex justify-between items-start mb-1">
                        {/* Left: Customer Name */}
                        <SelectableElement
                            id="bill-to-name"
                            selectedElement={selectedElement}
                            onSelect={onSelectElement}
                        >
                            <div style={{ fontSize: `${data.billToNameFontSize || 12}pt`, color: data.billToNameColor || billToColor, fontWeight: 600 }}>
                                {activeInvoice.client.name}
                            </div>
                        </SelectableElement>

                        {/* Right: Terms */}
                        <div className="flex flex-col items-end min-w-[220px]">
                            <div className="flex justify-between items-center w-full gap-4">
                                <SelectableElement id="terms-label" selectedElement={selectedElement} onSelect={onSelectElement}>
                                    <span style={{ fontSize: `${data.invoiceDetailLabelFontSize || 10}pt`, color: data.termsLabelColor || grayText }}>{data.termsLabel || 'Terms'} :</span>
                                </SelectableElement>
                                <SelectableElement id="terms-value" selectedElement={selectedElement} onSelect={onSelectElement}>
                                    <span style={{ fontSize: `${data.invoiceDetailValueFontSize || 10}pt`, fontWeight: 'bold', color: data.termsValueColor || '#1f2937' }}>{activeInvoice.terms}</span>
                                </SelectableElement>
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Address vs Due Date */}
                    <div className="flex justify-between items-start">
                        {/* Left: Address */}
                        <SelectableElement
                            id="bill-to-address"
                            selectedElement={selectedElement}
                            onSelect={onSelectElement}
                            className="max-w-[50%]"
                        >
                            <div style={{ fontSize: `${data.billToAddressFontSize || 10}pt`, color: data.billToAddressColor || billToColor }}>
                                {activeInvoice.client.address}
                            </div>
                        </SelectableElement>

                        {/* Right: Due Date */}
                        <div className="flex flex-col items-end min-w-[220px]">
                            {data.showDueDate !== false && (
                                <div className="flex justify-between items-center w-full gap-4">
                                    <SelectableElement id="due-date-label" selectedElement={selectedElement} onSelect={onSelectElement}>
                                        <span style={{ fontSize: `${data.invoiceDetailLabelFontSize || 10}pt`, color: data.dueDateLabelColor || grayText }}>{data.dueDateLabel || 'Due Date'} :</span>
                                    </SelectableElement>
                                    <SelectableElement id="due-date-value" selectedElement={selectedElement} onSelect={onSelectElement}>
                                        <span style={{ fontSize: `${data.invoiceDetailValueFontSize || 10}pt`, fontWeight: 'bold', color: data.dueDateValueColor || darkText }}>{activeInvoice.dueDate}</span>
                                    </SelectableElement>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <SelectableElement
                    id="table"
                    selectedElement={selectedElement}
                    onSelect={onSelectElement}
                    className="mb-5"
                    style={{ marginBottom: '20px' }}
                >
                    <table className="w-full border-collapse">
                        {data.showTableHeader !== false && (
                            <thead id="table-head">
                                <tr style={{ backgroundColor: data.tableHeaderBgColor || primaryColor }}>
                                    {enabledColumns.map((col) => (
                                        <th
                                            key={col.key}
                                            className="p-0"
                                            style={{ width: `${col.width}px` }}
                                        >
                                            <SelectableElement
                                                id="table-header"
                                                selectedElement={selectedElement}
                                                onSelect={onSelectElement}
                                                className="font-bold block"
                                                style={{
                                                    padding: '7px 9px',
                                                    textAlign: col.align,
                                                    color: data.tableHeaderTextColor || '#ffffff',
                                                    fontSize: `${data.tableFontSize || 10}pt`,
                                                }}
                                            >
                                                {col.label}
                                            </SelectableElement>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                        )}
                        <tbody id="table-body">
                            {activeInvoice.items.map((item: InvoiceItem, i: number) => (
                                <tr
                                    key={i}
                                    style={{
                                        breakInside: 'avoid',
                                        backgroundColor: data.alternateRowColors !== false && i % 2 === 0
                                            ? (data.tableRowColor || '#fffbeb')
                                            : '#ffffff',
                                        borderBottom: `1px solid ${grayBorder}`
                                    }}
                                >
                                    {enabledColumns.map((col) => (
                                        <td
                                            key={col.key}
                                            className="p-0"
                                            style={{ width: `${col.width}px` }}
                                        >
                                            <SelectableElement
                                                id="table-body"
                                                selectedElement={selectedElement}
                                                onSelect={onSelectElement}
                                                className="block"
                                                style={{
                                                    padding: '10px 12px',
                                                    fontSize: `${data.tableFontSize || 10}pt`,
                                                    color: darkText,
                                                    textAlign: col.align
                                                }}
                                            >
                                                {getCellValue(item, col.key)}
                                            </SelectableElement>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </SelectableElement>

                <SelectableElement
                    id="total"
                    selectedElement={selectedElement}
                    onSelect={onSelectElement}
                    className="flex justify-end"
                    style={{ marginBottom: '32px' }}
                >
                    <div className="w-[260px]">
                        {/* Sub Total */}
                        {data.showSubtotal !== false && (
                            <SelectableElement
                                id="subtotal-label"
                                selectedElement={selectedElement}
                                onSelect={onSelectElement}
                            >
                                <div className="flex justify-between py-2">
                                    <span style={{ fontSize: `${data.labelFontSize || 11}pt`, color: grayText }}>{data.subtotalLabel || 'Sub Total'}</span>
                                    <span style={{ fontSize: `${data.labelFontSize || 11}pt`, fontWeight: 'bold', color: darkText }}>{formatCurrency(activeInvoice.subtotal)}</span>
                                </div>
                            </SelectableElement>
                        )}

                        {/* Tax */}
                        {data.showTax && (
                            <SelectableElement
                                id="tax-label"
                                selectedElement={selectedElement}
                                onSelect={onSelectElement}
                            >
                                <div className="flex justify-between py-1.5">
                                    <span style={{ fontSize: `${data.labelFontSize || 10}pt`, color: grayText }}>{data.taxLabel || 'Tax'}</span>
                                    <span style={{ fontSize: `${data.labelFontSize || 10}pt`, color: darkText }}>{formatCurrency(0)}</span>
                                </div>
                            </SelectableElement>
                        )}

                        {/* Discount */}
                        {data.showDiscount && (
                            <div id="discount-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                                <span style={{ fontSize: `${data.labelFontSize || 10}pt`, color: grayText }}>{data.discountLabel || 'Discount'}</span>
                                <span style={{ fontSize: `${data.labelFontSize || 10}pt`, color: darkText }}>-{formatCurrency(0)}</span>
                            </div>
                        )}

                        {/* Previous Remaining */}
                        {data.showPreviousDue !== false && (
                            <SelectableElement
                                id="previous-remaining"
                                selectedElement={selectedElement}
                                onSelect={onSelectElement}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${grayBorder}` }}>
                                    <span style={{ fontSize: `${data.labelFontSize || 10}pt`, color: grayText }}>{data.previousDueLabel || 'Previous Remaining'}</span>
                                    <span style={{ fontSize: `${data.labelFontSize || 10}pt`, color: previousDueColor }}>{formatCurrency(activeInvoice.previousRemaining)}</span>
                                </div>
                            </SelectableElement>
                        )}

                        {/* Total */}
                        {data.showTotal !== false && (
                            <SelectableElement
                                id="total-label"
                                selectedElement={selectedElement}
                                onSelect={onSelectElement}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                                    <span style={{ fontSize: `${data.labelFontSize || 11}pt`, fontWeight: 'bold', color: grayText }}>{data.totalLabel || 'Total'}</span>
                                    <span style={{ fontSize: `${data.labelFontSize || 11}pt`, fontWeight: 'bold', color: redText }}>{formatCurrency(activeInvoice.total)}</span>
                                </div>
                            </SelectableElement>
                        )}
                        {/* Balance Due Box - Yellow - Separately Clickable */}
                        <SelectableElement
                            id="balance-due"
                            selectedElement={selectedElement}
                            onSelect={onSelectElement}
                        >
                            <div
                                id="balance-due-box"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: accentColor,
                                    padding: '10px 14px',
                                    marginTop: '4px'
                                }}
                            >
                                <span style={{ fontSize: `${data.labelFontSize || 11}pt`, fontWeight: 'bold', color: '#FFFFFF' }}>
                                    {data.balanceDueLabel || 'Balance Due'}
                                </span>
                                <span style={{ fontSize: `${data.labelFontSize || 13}pt`, fontWeight: 'bold', color: '#FFFFFF' }}>
                                    {formatCurrency(activeInvoice.total)}
                                </span>
                            </div>
                        </SelectableElement>
                    </div >
                </SelectableElement >

                {/* Notes Section - Clickable */}
                {
                    data.showNotes !== false && (
                        <SelectableElement
                            id="notes-label"
                            selectedElement={selectedElement}
                            onSelect={onSelectElement}
                            style={{ marginBottom: '30px' }}
                        >
                            <h3 style={{
                                fontSize: `${data.labelFontSize || 13}pt`,
                                fontWeight: 'bold',
                                color: darkText,
                                margin: '0 0 8px 0',
                                paddingBottom: '4px',
                                display: 'inline-block'
                            }}>
                                {data.notesLabel || 'Notes'}
                            </h3>
                            {/* Note content not clickable for label edit, but included in wrapper for UX */}
                            <div id="notes-content" style={{
                                fontSize: `${data.fontSize || 9}pt`,
                                color: grayText,
                                lineHeight: 1.6,
                                marginTop: '12px'
                            }} dangerouslySetInnerHTML={{ __html: activeInvoice.notes }}>
                            </div>
                        </SelectableElement>
                    )
                }
            </div >

            {/* Footer - Fixed at Bottom */}
            {
                data.showFooter !== false && (
                    <SelectableElement
                        id="footer"
                        selectedElement={selectedElement}
                        onSelect={onSelectElement}
                        style={{
                            backgroundColor: data.footerBackgroundColor || lightGrayBg,
                            borderTop: `1px solid ${grayBorder}`,
                            padding: '14px 20px',
                            textAlign: 'center' as const,
                            flexShrink: 0,
                            width: '100%',
                            ...footerStyle
                        }}
                    >
                        <p style={{
                            fontSize: `${data.footerFontSize || 9}pt`,
                            color: grayText,
                            margin: 0
                        }}>
                            {data.footerText || (
                                <>Powered by <span style={{ color: primaryColor, fontWeight: 'bold' }}>Revolutic</span> — Smart Invoicing</>
                            )}
                        </p>
                    </SelectableElement>
                )
            }
        </div >
    );
};

export default TemplatePreview;
