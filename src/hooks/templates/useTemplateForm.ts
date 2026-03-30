import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from '../../Service/axios';
import type { TemplateFormData, UseTemplateFormReturn, AlertState, TableColumn, TableColumnSetting } from '../../types/template.d';

// Table column configuration type moved to template.d.ts

// Default table columns matching current PDF
const DEFAULT_COLUMNS: TableColumn[] = [
    { key: 'index', label: '#', width: 30, align: 'left', enabled: true },
    { key: 'itemName', label: 'Item & Description', width: 200, align: 'left', enabled: true },
    { key: 'quantity', label: 'Qty', width: 50, align: 'center', enabled: true },
    { key: 'rate', label: 'Rate', width: 60, align: 'right', enabled: true },
    { key: 'amount', label: 'Amount', width: 70, align: 'right', enabled: true },
];

const DEFAULT_FORM_DATA: TemplateFormData = {
    templateName: '',
    isDefault: false,

    // Paper
    paperSize: 'A4',
    orientation: 'Portrait',
    marginTop: 0.7,
    marginBottom: 0.7,
    marginLeft: 0.55,
    marginRight: 0.4,
    padding: 10,

    // Colors - Matching generateInvoicePDF.ts design
    primaryColor: '#FF9608',      // Orange - for INVOICE title and table header
    secondaryColor: '#075056',    // Teal - for invoice number and Bill To
    backgroundColor: '#ffffff',
    accentColor: '#FBBF24',       // Yellow - for Balance Due box background
    textColor: '#1f2937',         // Dark text
    headerTextColor: '#FF9608',   // Orange for INVOICE title
    invoiceNumberColor: '#075056', // Teal - Default
    billToColor: '#075056',        // Teal - Default
    previousDueColor: '#075056',   // Teal - Default
    borderColor: '#e5e7eb',       // Gray border
    balanceDueTextColor: '#EE5858', // Red - for Balance Due text

    // Granular Bill To Styles
    billToNameColor: '#075056',
    billToAddressColor: '#075056',
    billToNameFontSize: 12,
    billToAddressFontSize: 10,

    // Granular Invoice Details Styles
    invoiceDateLabelColor: '#6b7280',
    invoiceDateValueColor: '#1f2937',
    dueDateLabelColor: '#6b7280',
    dueDateValueColor: '#1f2937',
    termsLabelColor: '#6b7280',
    termsValueColor: '#1f2937',
    invoiceDetailLabelFontSize: 10,
    invoiceDetailValueFontSize: 10,
    tableHeaderBgColor: '#FF9608', // Orange table header
    tableHeaderTextColor: '#ffffff', // White text on orange header
    tableRowColor: '#fffbeb',     // Light yellow alternating row
    tableAltRowColor: '#ffffff',  // White row
    tableBorderColor: '#e5e7eb',  // Gray border

    // Typography
    fontFamily: 'Helvetica',
    fontSize: 10,
    headingFontSize: 20,
    subheadingFontSize: 13,
    labelFontSize: 10,
    tableFontSize: 10,
    lineHeight: 1.5,
    letterSpacing: 0,
    fontWeight: 'normal',
    headingFontWeight: 'bold',

    // Logo
    logoWidth: 180,
    logoHeight: 80,
    logoPosition: 'left',
    logoMarginTop: 0,
    logoMarginBottom: 10,
    showLogo: true,

    // Branding
    brandName: '',
    tagline: '',

    // Borders
    borderStyle: 'solid',
    borderWidth: 1,
    sectionSpacing: 15,
    fieldSpacing: 5,
    tableBorderStyle: 'solid',

    // Labels - Matching PDF design
    invoiceLabel: 'INVOICE',
    billToLabel: 'Bill To',
    invoiceNumberLabel: 'Invoice#',
    invoiceDateLabel: 'Invoice Date',
    dueDateLabel: 'Due Date',
    termsLabel: 'Terms',
    itemsLabel: 'Item & Description',
    descriptionLabel: 'Description',
    quantityLabel: 'Hours',
    rateLabel: 'Rate',
    amountLabel: 'Amount',
    subtotalLabel: 'Sub Total',
    taxLabel: 'Tax',
    discountLabel: 'Discount',
    totalLabel: 'Total',
    notesLabel: 'Notes',
    previousDueLabel: 'Previous Remaining',
    balanceDueLabel: 'Balance Due',

    // Table
    tableColumnSettings: [
        { columnName: 'index', visible: true, width: '5%', alignment: 'center' },
        { columnName: 'itemName', visible: true, width: '40%', alignment: 'left' },
        { columnName: 'quantity', visible: true, width: '15%', alignment: 'center' },
        { columnName: 'rate', visible: true, width: '20%', alignment: 'right' },
        { columnName: 'amount', visible: true, width: '20%', alignment: 'right' },
    ],
    showTableBorders: true,
    showTableHeader: true,
    tableHeaderAlignment: 'left',
    alternateRowColors: true,

    // Field Visibility
    showInvoiceNumber: true,
    showInvoiceDate: true,
    showDueDate: true,
    showCustomerEmail: false,
    showCustomerPhone: false,
    showCustomerAddress: true,
    showItemDescription: true,
    showItemUnit: false,
    showSubtotal: true,
    showTax: false,
    showDiscount: true,
    showShipping: false,
    showNotes: true,
    showPreviousDue: true,

    // Header
    headerText: '',
    headerAlignment: 'left',
    headerFontSize: 14,
    headerFontWeight: 'bold',
    headerBackgroundColor: '',
    headerHeight: 0,
    showHeader: true,

    // Footer
    footerText: 'Powered by Revolutic — Smart Invoicing',
    footerAlignment: 'center',
    footerFontSize: 9,
    footerFontWeight: 'normal',
    footerBackgroundColor: '#f9fafb',
    footerHeight: 72,
    showFooter: true,
    showPageNumbers: false,
    pageNumberFormat: 'Page {n} of {total}',

    // Layout
    includePaymentStub: false,
    paymentStubPosition: 'bottom',
    layoutStyle: 'spacious',
    contentAlignment: 'left',
};

const useTemplateForm = (id?: string): UseTemplateFormReturn => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<TemplateFormData>(DEFAULT_FORM_DATA);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<AlertState>({
        show: false,
        type: 'info',
        message: '',
    });

    // Branding state (moved from component)
    const [branding, setBranding] = useState({
        brandName: '',
        tagline: '',
        logoPreview: ''
    });

    // Table columns state (moved from component)
    const [tableColumns, setTableColumns] = useState<TableColumn[]>(DEFAULT_COLUMNS);

    // Element selection state (moved from component)
    const [selectedElement, setSelectedElement] = useState<string>('');

    // Verify location state
    const { state } = useLocation();

    // Use ID from props or URL params
    const { id: paramId } = useParams();
    const effectiveId = id || paramId;

    console.log('[DEBUG] useTemplateForm render:', { idArg: id, paramId, effectiveId });

    // Fetch template data if ID is provided OR use state
    useEffect(() => {
        if (!effectiveId) return;

        // Check if template data is passed via router state
        if (state && state.template && state.template.id.toString() === effectiveId) {
            const data = state.template.raw || state.template;

            // Re-hydrate logic (same as fetch)
            setFormData(prev => ({
                ...prev,
                ...data,
                marginTop: data.margins?.top || prev.marginTop,
                marginBottom: data.margins?.bottom || prev.marginBottom,
                marginLeft: data.margins?.left || prev.marginLeft,
                marginRight: data.margins?.right || prev.marginRight,
                tableColumnSettings: data.tableColumnSettings || prev.tableColumnSettings,
            }));

            setBranding({
                brandName: data.brandName || '',
                tagline: data.tagline || '',
                logoPreview: data.logoUrl ? `/${data.logoUrl.replace(/^\//, '')}` : ''
            });

            // Hydrate columns logic (reused)
            if (data.tableColumnSettings && data.tableColumnSettings.length > 0) {
                const mergedColumns = DEFAULT_COLUMNS.map(defCol => {
                    const saved = data.tableColumnSettings.find((c: TableColumnSetting) => c.columnName === defCol.key || c.key === defCol.key);
                    if (saved) {
                        return {
                            ...defCol,
                            label: saved.label || defCol.label,
                            width: typeof saved.width === 'string' ? parseInt(saved.width) || defCol.width : (saved.width as number),
                            align: saved.alignment || defCol.align,
                            enabled: saved.visible !== false
                        };
                    }
                    return { ...defCol, enabled: false };
                });

                const customColumns = data.tableColumnSettings
                    .filter((c: TableColumnSetting) => !DEFAULT_COLUMNS.find(d => d.key === c.columnName || d.key === c.key))
                    .map((c: TableColumnSetting) => ({
                        key: c.columnName || (c.key as string),
                        label: c.label || 'Custom Column',
                        width: typeof c.width === 'string' ? parseInt(c.width) || 100 : (c.width as number),
                        align: c.alignment || 'left',
                        enabled: c.visible !== false
                    }));

                setTableColumns([...mergedColumns, ...customColumns]);
            }

            setLoading(false);
            return; // Skip fetch
        }

        const fetchTemplate = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/templates/${effectiveId}`);

                const data = response.data;

                // Map API response to form data structure
                setFormData(prev => ({
                    ...prev,
                    ...data,
                    // Handle nested objects if necessary
                    marginTop: data.margins?.top || prev.marginTop,
                    marginBottom: data.margins?.bottom || prev.marginBottom,
                    marginLeft: data.margins?.left || prev.marginLeft,
                    marginRight: data.margins?.right || prev.marginRight,
                    // Ensure table settings are preserved
                    tableColumnSettings: data.tableColumnSettings || prev.tableColumnSettings,
                }));

                // Load branding
                setBranding({
                    brandName: data.brandName || '',
                    tagline: data.tagline || '',
                    logoPreview: data.logoUrl ? `/${data.logoUrl.replace(/^\//, '')}` : ''
                });

                // Load table columns
                if (data.tableColumnSettings && data.tableColumnSettings.length > 0) {
                    // Merge saved columns with defaults to ensure standard columns exist (even if disabled)
                    // 1. Map defaults, checking if they exist in DB data
                    const mergedColumns = DEFAULT_COLUMNS.map(defCol => {
                        const saved = data.tableColumnSettings.find((c: TableColumnSetting) => c.columnName === defCol.key || c.key === defCol.key);
                        if (saved) {
                            return {
                                ...defCol,
                                label: saved.label || defCol.label,
                                width: typeof saved.width === 'string' ? parseInt(saved.width) || defCol.width : (saved.width as number),
                                align: saved.alignment || defCol.align,
                                enabled: saved.visible !== false // True unless explicitly false
                            };
                        }
                        // If default col not in DB (means it was disabled and not saved), start as disabled
                        return { ...defCol, enabled: false };
                    });

                    // 2. Add any custom columns (not in defaults) found in DB
                    const customColumns = data.tableColumnSettings
                        .filter((c: TableColumnSetting) => !DEFAULT_COLUMNS.find(d => d.key === c.columnName || d.key === c.key))
                        .map((c: TableColumnSetting) => ({
                            key: c.columnName || (c.key as string),
                            label: c.label || 'Custom Column',
                            width: typeof c.width === 'string' ? parseInt(c.width) || 100 : (c.width as number),
                            align: c.alignment || 'left',
                            enabled: c.visible !== false
                        }));

                    setTableColumns([...mergedColumns, ...customColumns]);
                }
            } catch (err: unknown) {
                console.error('Error fetching template:', err);
                setAlert({
                    show: true,
                    type: 'error',
                    message: 'Failed to load template data',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchTemplate();
    }, [effectiveId, state]);

    // Sync branding to formData whenever it changes
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            brandName: branding.brandName,
            tagline: branding.tagline,
        }));
    }, [branding.brandName, branding.tagline]);

    // Sync table columns to formData whenever they change
    useEffect(() => {
        // Only save ENABLED columns to DB as requested
        const settings = tableColumns
            .filter(col => col.enabled)
            .map(col => ({
                columnName: col.key,
                label: col.label,
                visible: true, // Always true since we filtered
                width: col.width.toString(),
                alignment: col.align
            }));

        setFormData(prev => ({
            ...prev,
            tableColumnSettings: settings as TableColumnSetting[]
        }));
    }, [tableColumns]);

    const handleChange = (field: keyof TemplateFormData, value: string | number | boolean | File | null | undefined) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleLogoUpload = (file: File) => {
        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
            setBranding(prev => ({ ...prev, logoPreview: reader.result as string }));
        };
        reader.readAsDataURL(file);

        // Update formData with file
        setFormData(prev => ({ ...prev, logoFile: file }));
    };

    // Handle column changes (moved from component)
    const handleColumnChange = useCallback((index: number, field: keyof TableColumn, value: string | number | boolean) => {
        setTableColumns(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value } as TableColumn;
            return updated;
        });
    }, []);

    // Toggle column enabled/disabled (moved from component)
    const toggleColumn = useCallback((index: number) => {
        setTableColumns(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], enabled: !updated[index].enabled };
            return updated;
        });
    }, []);

    // Add new column (moved from component)
    const addColumn = useCallback(() => {
        const newKey = `custom_${Date.now()}`;
        setTableColumns(prev => [
            ...prev,
            { key: newKey, label: 'New Column', width: 80, align: 'left', enabled: true }
        ]);
    }, []);

    // Remove column (moved from component)
    const removeColumn = useCallback((index: number) => {
        setTableColumns(prev => prev.filter((_, i) => i !== index));
    }, []);

    // Handle element selection (moved from component)
    const handleSelectElement = useCallback((elementId: string) => {
        setSelectedElement(elementId);
    }, []);

    // Branding setters
    const setBrandName = useCallback((name: string) => {
        setBranding(prev => ({ ...prev, brandName: name }));
    }, []);

    const setTagline = useCallback((tagline: string) => {
        setBranding(prev => ({ ...prev, tagline: tagline }));
    }, []);

    const handleSubmit = useCallback(async (setAsDefault = false) => {
        try {
            setLoading(true);
            console.log('[DEBUG] handleSubmit called. effectiveId:', effectiveId);

            const submitData = new FormData();

            // Add all form fields
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'logoFile') return; // Handle separately
                if (key === 'tableColumnSettings') {
                    submitData.append(key, JSON.stringify(value));
                } else {
                    // Safety check for null/undefined values before calling toString()
                    const safeValue = (value === null || value === undefined) ? '' : value.toString();
                    submitData.append(key, safeValue);
                }
            });

            // Add margins as nested object
            submitData.set('margins', JSON.stringify({
                top: formData.marginTop,
                bottom: formData.marginBottom,
                left: formData.marginLeft,
                right: formData.marginRight,
            }));

            if (setAsDefault) {
                submitData.set('isDefault', 'true');
            }

            // Add logo file if exists
            if (formData.logoFile) {
                submitData.append('logo', formData.logoFile);
            }

            if (effectiveId) {
                await axios.put(
                    `/templates/${effectiveId}`,
                    submitData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        }
                    }
                );
            } else {
                await axios.post(
                    `/templates`,
                    submitData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        }
                    }
                );
            }
            setAlert({
                show: true,
                type: 'success',
                message: `Template ${effectiveId ? 'updated' : 'created'} successfully`,
            });

            setTimeout(() => {
                navigate('/templates');
            }, 1500);
        } catch (err: unknown) {
            console.error('Error submitting template:', err);
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.message
                : (err instanceof Error ? err.message : 'Failed to save template');

            setAlert({
                show: true,
                type: 'error',
                message: errorMessage || 'Failed to save template',
            });
        } finally {
            setLoading(false);
        }
    }, [formData, effectiveId, navigate]);

    const dismissAlert = () => {
        setAlert({ show: false, type: 'info', message: '' });
    };

    const resetForm = () => {
        setFormData(DEFAULT_FORM_DATA);
        setBranding({ brandName: '', tagline: '', logoPreview: '' });
        setTableColumns(DEFAULT_COLUMNS);
        setSelectedElement('');
    };

    return {
        formData,
        handleChange,
        handleLogoUpload,
        handleSubmit,
        loading,
        alert,
        dismissAlert,
        resetForm,
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
    };
};

export default useTemplateForm;
