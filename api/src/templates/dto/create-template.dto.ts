import { IsString, IsOptional, IsBoolean, IsNumber, IsObject, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';

class MarginsDto {
    @IsNumber()
    top: number;

    @IsNumber()
    bottom: number;

    @IsNumber()
    left: number;

    @IsNumber()
    right: number;
}

class TableColumnSettingDto {
    @IsString()
    columnName: string;

    @IsOptional()
    @IsString()
    label?: string;

    @IsBoolean()
    visible: boolean;

    @IsString()
    width: string;

    @IsString()
    alignment: string;
}

export class CreateTemplateDto {
    @IsString()
    templateName: string;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isDefault?: boolean = false;

    @IsOptional()
    @IsString()
    paperSize?: string = 'A4';

    @IsOptional()
    @IsString()
    orientation?: string = 'Portrait';

    @IsOptional()
    @ValidateNested()
    @Type(() => MarginsDto)
    @Transform(({ value }) => typeof value === 'string' ? JSON.parse(value) : value)
    margins?: MarginsDto;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    padding?: number = 10;

    // Colors
    @IsOptional()
    @IsString()
    primaryColor?: string = '#FF9608';

    @IsOptional()
    @IsString()
    secondaryColor?: string = '#075056';

    @IsOptional()
    @IsString()
    backgroundColor?: string = '#ffffff';

    @IsOptional()
    @IsString()
    accentColor?: string = '#FBBF24';

    @IsOptional()
    @IsString()
    invoiceNumberColor?: string = '#075056';

    @IsOptional()
    @IsString()
    billToColor?: string = '#075056';

    @IsOptional()
    @IsString()
    previousDueColor?: string = '#075056';

    @IsOptional()
    @IsString()
    textColor?: string = '#1f2937';

    @IsOptional()
    @IsString()
    headerTextColor?: string = '#FF9608';

    @IsOptional()
    @IsString()
    tableHeaderBgColor?: string = '#FF9608';

    @IsOptional()
    @IsString()
    tableHeaderTextColor?: string = '#ffffff';

    @IsOptional()
    @IsString()
    tableRowColor?: string = '#fffbeb';

    @IsOptional()
    @IsString()
    tableAltRowColor?: string = '#ffffff';

    @IsOptional()
    @IsString()
    tableBorderColor?: string = '#e5e7eb';

    @IsOptional()
    @IsString()
    borderColor?: string = '#e5e7eb';

    @IsOptional()
    @IsString()
    balanceDueTextColor?: string = '#FBBF24';

    // Typography
    @IsOptional()
    @IsString()
    fontFamily?: string = 'Helvetica';

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    fontSize?: number = 8;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    headingFontSize?: number = 24;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    subheadingFontSize?: number = 16;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    labelFontSize?: number = 8;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    tableFontSize?: number = 8;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    lineHeight?: number = 1.5;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    letterSpacing?: number = 0;

    @IsOptional()
    @IsString()
    fontWeight?: string = 'normal';

    @IsOptional()
    @IsString()
    headingFontWeight?: string = 'bold';

    // Logo
    @IsOptional()
    @IsString()
    logoUrl?: string;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    logoWidth?: number = 150;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    logoHeight?: number = 50;

    @IsOptional()
    @IsString()
    logoPosition?: string = 'left';

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    logoMarginTop?: number = 0;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    logoMarginBottom?: number = 10;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    showLogo?: boolean = true;

    // Branding
    @IsOptional()
    @IsString()
    brandName?: string = 'revolutic';

    @IsOptional()
    @IsString()
    tagline?: string = 'digital innovation leadership';

    // Border & Spacing
    @IsOptional()
    @IsString()
    borderStyle?: string = 'solid';

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    borderWidth?: number = 1;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    sectionSpacing?: number = 15;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    fieldSpacing?: number = 5;

    @IsOptional()
    @IsString()
    tableBorderStyle?: string = 'solid';

    // Text Labels
    @IsOptional()
    @IsString()
    invoiceLabel?: string = 'INVOICE';

    @IsOptional()
    @IsString()
    billToLabel?: string = 'Bill To';

    @IsOptional()
    @IsString()
    invoiceNumberLabel?: string = 'Invoice#';

    @IsOptional()
    @IsString()
    invoiceDateLabel?: string = 'Invoice Date';

    @IsOptional()
    @IsString()
    dueDateLabel?: string = 'Due Date';

    @IsOptional()
    @IsString()
    termsLabel?: string = 'Terms';

    @IsOptional()
    @IsString()
    itemsLabel?: string = 'Item & Description';

    @IsOptional()
    @IsString()
    descriptionLabel?: string = 'Description';

    @IsOptional()
    @IsString()
    quantityLabel?: string = 'Hours';

    @IsOptional()
    @IsString()
    rateLabel?: string = 'Rate';

    @IsOptional()
    @IsString()
    amountLabel?: string = 'Amount';

    @IsOptional()
    @IsString()
    subtotalLabel?: string = 'Sub Total';

    @IsOptional()
    @IsString()
    taxLabel?: string = 'Tax';

    @IsOptional()
    @IsString()
    discountLabel?: string = 'Discount';

    @IsOptional()
    @IsString()
    totalLabel?: string = 'Total';

    @IsOptional()
    @IsString()
    notesLabel?: string = 'Notes';

    @IsOptional()
    @IsString()
    previousDueLabel?: string = 'Previous Remaining';

    @IsOptional()
    @IsString()
    balanceDueLabel?: string = 'Balance Due';

    // Table Configuration
    @IsOptional()
    @ValidateNested({ each: true })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch (e) {
                return [];
            }
        }
        return value;
    })
    @Type(() => TableColumnSettingDto)
    tableColumnSettings?: TableColumnSettingDto[];

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    showTableBorders?: boolean = true;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    showTableHeader?: boolean = true;

    @IsOptional()
    @IsString()
    tableHeaderAlignment?: string = 'left';

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    alternateRowColors?: boolean = true;

    // Field Visibility
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    showInvoiceNumber?: boolean = true;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    showInvoiceDate?: boolean = true;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    showDueDate?: boolean = true;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    showCustomerEmail?: boolean = true;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    showCustomerPhone?: boolean = true;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    showCustomerAddress?: boolean = true;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    showItemDescription?: boolean = true;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    showItemUnit?: boolean = true;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    showSubtotal?: boolean = true;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    showTax?: boolean = false;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    showDiscount?: boolean = false;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    showShipping?: boolean = false;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    showNotes?: boolean = true;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    showPreviousDue?: boolean = true;

    // Header Section
    @IsOptional()
    @IsString()
    headerText?: string;

    @IsOptional()
    @IsString()
    headerAlignment?: string = 'center';

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    headerFontSize?: number = 14;

    @IsOptional()
    @IsString()
    headerFontWeight?: string = 'bold';

    @IsOptional()
    @IsString()
    headerBackgroundColor?: string;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    headerHeight?: number;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    showHeader?: boolean = false;

    // Footer Section
    @IsOptional()
    @IsString()
    footerText?: string;

    @IsOptional()
    @IsString()
    footerAlignment?: string = 'center';

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    footerFontSize?: number = 10;

    @IsOptional()
    @IsString()
    footerFontWeight?: string = 'normal';

    @IsOptional()
    @IsString()
    footerBackgroundColor?: string;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    footerHeight?: number;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    showFooter?: boolean = true;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    showPageNumbers?: boolean = false;

    @IsOptional()
    @IsString()
    pageNumberFormat?: string = 'Page {n} of {total}';

    // Layout Options
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    includePaymentStub?: boolean = false;

    @IsOptional()
    @IsString()
    paymentStubPosition?: string = 'bottom';

    @IsOptional()
    @IsString()
    layoutStyle?: string = 'spacious';

    @IsOptional()
    @IsString()
    contentAlignment?: string = 'left';
}
