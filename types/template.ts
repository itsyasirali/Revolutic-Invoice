export type PaperSize = "A4" | "A5" | "Letter";
export type Orientation = "Portrait" | "Landscape";
export type BorderStyle = "none" | "solid" | "dashed" | "dotted";
export type FontWeight = "normal" | "bold" | "light";
export type Alignment = "left" | "center" | "right";
export type LayoutStyle = "compact" | "spacious" | "custom";
export type ContentAlignment = "left" | "center" | "justify";
export type PaymentStubPosition = "bottom" | "separatePage";
export type ColumnName =
  | "index"
  | "itemName"
  | "description"
  | "quantity"
  | "unit"
  | "rate"
  | "amount";

export interface TemplateMargins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface TableColumnSetting {
  columnName: string;
  key?: string;
  label?: string;
  visible: boolean;
  width: string | number;
  alignment: Alignment;
}

export interface TableColumn {
  key: string;
  label: string;
  width: number;
  align: Alignment;
  enabled: boolean;
}

export interface Template {
  id: number;
  userId: string;
  templateName: string;
  isDefault: boolean;

  // Paper Settings
  paperSize: PaperSize;
  orientation: Orientation;
  margins: TemplateMargins;
  padding: number;

  // Color Scheme
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  accentColor: string;
  textColor: string;
  headerTextColor: string;
  invoiceNumberColor: string;
  billToColor: string;
  previousDueColor: string;
  tableHeaderBgColor: string;
  tableHeaderTextColor: string;
  tableRowColor: string;
  tableAltRowColor: string;
  tableBorderColor: string;
  borderColor: string;
  balanceDueTextColor: string;

  // Granular Bill To Styles
  billToNameColor: string;
  billToAddressColor: string;
  billToNameFontSize: number;
  billToAddressFontSize: number;

  // Granular Invoice Details Styles
  invoiceDateLabelColor: string;
  invoiceDateValueColor: string;
  dueDateLabelColor: string;
  dueDateValueColor: string;
  termsLabelColor: string;
  termsValueColor: string;
  invoiceDetailLabelFontSize: number;
  invoiceDetailValueFontSize: number;

  // Typography
  fontFamily: string;
  fontSize: number;
  headingFontSize: number;
  subheadingFontSize: number;
  labelFontSize: number;
  tableFontSize: number;
  lineHeight: number;
  letterSpacing: number;
  fontWeight: FontWeight;
  headingFontWeight: FontWeight;

  // Logo Settings
  logoUrl?: string;
  logoWidth: number;
  logoHeight: number;
  logoPosition: Alignment;
  logoMarginTop: number;
  logoMarginBottom: number;
  showLogo: boolean;

  // Branding
  brandName: string;
  tagline: string;

  // Border & Spacing
  borderStyle: BorderStyle;
  borderWidth: number;
  sectionSpacing: number;
  fieldSpacing: number;
  tableBorderStyle: BorderStyle;

  // Text Labels
  invoiceLabel: string;
  billToLabel: string;
  invoiceNumberLabel: string;
  invoiceDateLabel: string;
  dueDateLabel: string;
  termsLabel: string;
  itemsLabel: string;
  descriptionLabel: string;
  quantityLabel: string;
  rateLabel: string;
  amountLabel: string;
  subtotalLabel: string;
  taxLabel: string;
  discountLabel: string;
  totalLabel: string;
  notesLabel: string;
  previousDueLabel: string;
  balanceDueLabel: string;

  // Table Configuration
  tableColumnSettings: TableColumnSetting[];
  showTableBorders: boolean;
  showTableHeader: boolean;
  tableHeaderAlignment: Alignment;
  alternateRowColors: boolean;

  // Field Visibility
  showInvoiceNumber: boolean;
  showInvoiceDate: boolean;
  showDueDate: boolean;
  showCustomerEmail: boolean;
  showCustomerPhone: boolean;
  showCustomerAddress: boolean;
  showItemDescription: boolean;
  showItemUnit: boolean;
  showSubtotal: boolean;
  showTax: boolean;
  showDiscount: boolean;
  showShipping: boolean;
  showNotes: boolean;
  showPreviousDue: boolean;

  // Header Section
  headerText?: string;
  headerAlignment: Alignment;
  headerFontSize: number;
  headerFontWeight: FontWeight;
  headerBackgroundColor?: string;
  headerHeight?: number;
  showHeader: boolean;

  // Footer Section
  footerText?: string;
  footerAlignment: Alignment;
  footerFontSize: number;
  footerFontWeight: FontWeight;
  footerBackgroundColor?: string;
  footerHeight?: number;
  showFooter: boolean;
  showPageNumbers: boolean;
  pageNumberFormat: string;

  // Layout Options
  includePaymentStub: boolean;
  paymentStubPosition: PaymentStubPosition;
  layoutStyle: LayoutStyle;
  contentAlignment: ContentAlignment;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface TemplateListItem {
  id: string;
  name: string;
  paperSize: string;
  orientation: string;
  isDefault: boolean;
  createdAt: string;
  raw: Template;
}

export interface TemplateFormData {
  templateName: string;
  isDefault: boolean;

  // Paper Settings
  paperSize: PaperSize;
  orientation: Orientation;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  padding: number;

  // Colors
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  accentColor: string;
  textColor: string;
  headerTextColor: string;
  invoiceNumberColor: string;
  billToColor: string;
  previousDueColor: string;
  borderColor: string;
  balanceDueTextColor: string;

  // Granular Bill To Styles
  billToNameColor: string;
  billToAddressColor: string;
  billToNameFontSize: number;
  billToAddressFontSize: number;

  // Granular Invoice Details Styles
  invoiceDateLabelColor: string;
  invoiceDateValueColor: string;
  dueDateLabelColor: string;
  dueDateValueColor: string;
  termsLabelColor: string;
  termsValueColor: string;
  invoiceDetailLabelFontSize: number;
  invoiceDetailValueFontSize: number;

  // Table Colors
  tableHeaderBgColor: string;
  tableHeaderTextColor: string;
  tableRowColor: string;
  tableAltRowColor: string;
  tableBorderColor: string;

  // Typography
  fontFamily: string;
  fontSize: number;
  headingFontSize: number;
  subheadingFontSize: number;
  labelFontSize: number;
  tableFontSize: number;
  lineHeight: number;
  letterSpacing: number;
  fontWeight: FontWeight;
  headingFontWeight: FontWeight;

  // Logo
  logoFile?: File;
  logoUrl?: string;
  logoWidth: number;
  logoHeight: number;
  logoPosition: Alignment;
  logoMarginTop: number;
  logoMarginBottom: number;
  showLogo: boolean;

  // Branding
  brandName: string;
  tagline: string;

  // Borders & Spacing
  borderStyle: BorderStyle;
  borderWidth: number;
  sectionSpacing: number;
  fieldSpacing: number;
  tableBorderStyle: BorderStyle;

  // Text Labels
  invoiceLabel: string;
  billToLabel: string;
  invoiceNumberLabel: string;
  invoiceDateLabel: string;
  dueDateLabel: string;
  termsLabel: string;
  itemsLabel: string;
  descriptionLabel: string;
  quantityLabel: string;
  rateLabel: string;
  amountLabel: string;
  subtotalLabel: string;
  taxLabel: string;
  discountLabel: string;
  totalLabel: string;
  notesLabel: string;
  previousDueLabel: string;
  balanceDueLabel: string;

  // Table Config
  tableColumnSettings: TableColumnSetting[];
  showTableBorders: boolean;
  showTableHeader: boolean;
  tableHeaderAlignment: Alignment;
  alternateRowColors: boolean;

  // Field Visibility
  showInvoiceNumber: boolean;
  showInvoiceDate: boolean;
  showDueDate: boolean;
  showCustomerEmail: boolean;
  showCustomerPhone: boolean;
  showCustomerAddress: boolean;
  showItemDescription: boolean;
  showItemUnit: boolean;
  showSubtotal: boolean;
  showTax: boolean;
  showDiscount: boolean;
  showShipping: boolean;
  showNotes: boolean;
  showPreviousDue: boolean;

  // Header
  headerText: string;
  headerAlignment: Alignment;
  headerFontSize: number;
  headerFontWeight: FontWeight;
  headerBackgroundColor: string;
  headerHeight: number;
  showHeader: boolean;

  // Footer
  footerText: string;
  footerAlignment: Alignment;
  footerFontSize: number;
  footerFontWeight: FontWeight;
  footerBackgroundColor: string;
  footerHeight: number;
  showFooter: boolean;
  showPageNumbers: boolean;
  pageNumberFormat: string;

  // Layout
  includePaymentStub: boolean;
  paymentStubPosition: PaymentStubPosition;
  layoutStyle: LayoutStyle;
  contentAlignment: ContentAlignment;
}

export interface AlertState {
  show: boolean;
  type: "success" | "error" | "warning" | "info";
  message: string;
}

// Hook Return Types

export interface UseTemplatesListReturn {
  templates: TemplateListItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredTemplates: TemplateListItem[];
}

export interface UseTemplateFormReturn {
  formData: TemplateFormData;
  handleChange: (
    field: keyof TemplateFormData,
    value: string | number | boolean | File | null | undefined
  ) => void;
  handleLogoUpload: (file: File) => void;
  handleSubmit: (setAsDefault?: boolean) => Promise<void>;
  loading: boolean;
  alert: AlertState;
  dismissAlert: () => void;
  resetForm: () => void;

  // Branding state
  branding: {
    brandName: string;
    tagline: string;
    logoPreview: string;
  };
  setBrandName: (name: string) => void;
  setTagline: (tagline: string) => void;

  // Table columns state and functions
  tableColumns: TableColumn[];
  handleColumnChange: (
    index: number,
    field: keyof TableColumn,
    value: string | number | boolean
  ) => void;
  toggleColumn: (index: number) => void;
  addColumn: () => void;
  removeColumn: (index: number) => void;

  // Element selection
  selectedElement: string;
  handleSelectElement: (elementId: string) => void;
}

export interface UseTemplateActionsProps {
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  refetch: () => Promise<void>;
}

export interface UseTemplateActionsReturn {
  handleDelete: (ids?: string[]) => void;
  handleSetDefault: (id: string) => Promise<void>;
  handleEdit: (id: string, template?: Template) => void;
  handlePreview: (id: string) => void;
  confirmDialog: {
    show: boolean;
    selectedIds: string[];
  };
  confirmDelete: () => Promise<void>;
  hideConfirmDialog: () => void;
}

export interface UseCreateTemplateReturn {
  createTemplate: (data: TemplateFormData) => Promise<{ id: string }>;
  loading: boolean;
  alert: AlertState;
  dismissAlert: () => void;
}

export interface UseUpdateTemplateReturn {
  updateTemplate: (id: string, data: TemplateFormData) => Promise<void>;
  loading: boolean;
  alert: AlertState;
  dismissAlert: () => void;
}

export interface UseDeleteTemplatesReturn {
  deleteTemplates: (ids: string[]) => Promise<void>;
  loading: boolean;
  alert: AlertState;
  dismissAlert: () => void;
  confirmDialog: {
    show: boolean;
    selectedIds: string[];
  };
  confirmDelete: () => Promise<void>;
  hideConfirmDialog: () => void;
}

export interface UseSetDefaultTemplateReturn {
  setDefaultTemplate: (id: string) => Promise<void>;
  loading: boolean;
  alert: AlertState;
  dismissAlert: () => void;
}

export interface UseTemplateDetailsReturn {
  template: Template | null;
  loading: boolean;
  error: string | null;
}

export interface ColorInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

export interface LabelStyleProps {
  label: string;
  textValue: string;
  textColor?: string;
  bgColor?: string;
  fontSize?: number;
  onTextChange: (val: string) => void;
  onTextColorChange?: (val: string) => void;
  onBgColorChange?: (val: string) => void;
  onFontSizeChange?: (val: number) => void;
  showColor?: boolean;
  showBg?: boolean;
  showSize?: boolean;
}

export interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  icon?: React.ReactNode;
  id?: string;
  isSelected?: boolean;
}

export interface PaperDimensions {
  width: string;
  height: string;
}

export interface UseTemplateFormViewReturn extends UseTemplateFormReturn {
  activeNav: string;
  setActiveNav: (nav: any) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onLogoFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  templateConfig: any;
  paperDims: PaperDimensions;
  isSectionOpen: (key: string, isSelected?: boolean) => boolean;
  toggleSection: (key: string, isSelected?: boolean) => void;
  handlePreviewSelection: (elementId: string) => void;
}

export interface TemplateCardProps {
  template: TemplateListItem;
  index: number;
  onEdit: (id: string) => void;
  onSetActive: (id: string) => void;
  onPreview: (template: TemplateListItem) => void;
  onClone?: (template: TemplateListItem) => void;
  onDelete?: (id: string) => void;
  mode?: "manage" | "select";
  selected?: boolean;
  onClick?: (template: TemplateListItem) => void;
}

export interface TemplateListProps {
  initialTemplates?: TemplateListItem[];
}

export interface TemplatePreviewModalProps {
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

// The following types describe the rendering-only data shape consumed by
// TemplatePreview.tsx. They are intentionally separate from the domain
// Template/TableColumn/TableColumnSetting types above (different shape,
// preview-specific), hence the "TemplatePreview" prefix to avoid collisions.
export interface TemplatePreviewTableColumn {
  key: string;
  label: string;
  width: number;
  align: "left" | "center" | "right";
  enabled: boolean;
}

export interface TemplatePreviewInvoiceItem {
  index: number;
  itemName: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface TemplatePreviewBranding {
  brandName?: string;
  tagline?: string;
  logoPreview?: string;
}

export interface TemplatePreviewTableColumnSetting {
  columnName?: string;
  key?: string;
  label?: string;
  width?: string | number;
  alignment?: "left" | "center" | "right";
  visible?: boolean;
}

export interface TemplatePreviewTemplateData {
  primaryColor?: string;
  accentColor?: string;
  secondaryColor?: string;
  invoiceNumberColor?: string;
  billToColor?: string;
  previousDueColor?: string;
  textColor?: string;
  footerBackgroundColor?: string;
  borderColor?: string;
  headerTextColor?: string;
  tableBorderColor?: string;
  tableHeaderBgColor?: string;
  tableHeaderTextColor?: string;
  tableRowColor?: string;
  tableAltRowColor?: string;
  invoiceDateLabelColor?: string;
  invoiceDateValueColor?: string;
  termsLabelColor?: string;
  termsValueColor?: string;
  dueDateLabelColor?: string;
  dueDateValueColor?: string;
  billToNameColor?: string;
  billToAddressColor?: string;
  balanceDueTextColor?: string;

  branding?: TemplatePreviewBranding;
  brandName?: string;
  tagline?: string;
  logoUrl?: string;
  showLogo?: boolean;

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

  invoiceLabel?: string;
  billToLabel?: string;
  invoiceDateLabel?: string;
  termsLabel?: string;
  dueDateLabel?: string;
  itemsLabel?: string;
  quantityLabel?: string;
  rateLabel?: string;
  amountLabel?: string;
  subtotalLabel?: string;
  taxLabel?: string;
  discountLabel?: string;
  previousDueLabel?: string;
  totalLabel?: string;
  balanceDueLabel?: string;
  notesLabel?: string;
  footerText?: string;

  showInvoiceDate?: boolean;
  showDueDate?: boolean;
  showTableHeader?: boolean;
  alternateRowColors?: boolean;
  showSubtotal?: boolean;
  showTax?: boolean;
  showDiscount?: boolean;
  showPreviousDue?: boolean;
  showTotal?: boolean;
  showNotes?: boolean;
  showFooter?: boolean;

  marginTop?: number;
  marginRight?: number;
  marginLeft?: number;
  paperSize?: string;
  orientation?: string;
  backgroundColor?: string;

  tableColumns?: TemplatePreviewTableColumn[];
  tableColumnSettings?: TemplatePreviewTableColumnSetting[];
}

export interface TemplatePreviewInvoiceItemData {
  title?: string;
  description?: string;
  quantity?: number | string;
  rate?: number | string;
  amount?: number | string;
  name?: string;
  item?: { name?: string };
  [key: string]: unknown;
}

export interface TemplatePreviewCustomerData {
  displayName?: string;
  companyName?: string;
  address?: string;
}

export interface TemplatePreviewInvoiceData {
  invoiceNumber?: string;
  invoiceDate?: string | Date;
  dueDate?: string | Date;
  formattedDueDate?: string;
  terms?: string;
  customerDisplayName?: string;
  customerId?: TemplatePreviewCustomerData;
  customer?: TemplatePreviewCustomerData;
  customerAddress?: string;
  items?: TemplatePreviewInvoiceItemData[];
  subTotal?: number | string;
  subtotal?: number | string;
  previousRemaining?: number | string;
  remaining?: number | string;
  total?: number | string;
  currency?: string;
  notes?: string;
}

export interface TemplatePreviewProps {
  data: TemplatePreviewTemplateData;
  invoice?: TemplatePreviewInvoiceData;
  selectedElement?: string;
  onSelectElement?: (element: string) => void;
  style?: React.CSSProperties;
  className?: string;
  footerStyle?: React.CSSProperties;
}

