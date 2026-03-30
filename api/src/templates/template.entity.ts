import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('templates')
export class Template {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  templateName: string;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: 'A4' })
  paperSize: string; // 'A4' | 'A5' | 'Letter'

  @Column({ default: 'Portrait' })
  orientation: string; // 'Portrait' | 'Landscape'

  @Column('jsonb')
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };

  @Column({ default: 10 })
  padding: number;

  // Colors
  @Column({ default: '#FF9608' }) primaryColor: string;
  @Column({ default: '#075056' }) secondaryColor: string;
  @Column({ default: '#ffffff' }) backgroundColor: string;
  @Column({ default: '#FBBF24' }) accentColor: string;
  @Column({ default: '#075056' }) invoiceNumberColor: string;
  @Column({ default: '#075056' }) billToColor: string;
  @Column({ default: '#075056' }) previousDueColor: string;
  @Column({ default: '#1f2937' }) textColor: string;
  @Column({ default: '#FF9608' }) headerTextColor: string;
  @Column({ default: '#FF9608' }) tableHeaderBgColor: string;
  @Column({ default: '#ffffff' }) tableHeaderTextColor: string;
  @Column({ default: '#fffbeb' }) tableRowColor: string;
  @Column({ default: '#ffffff' }) tableAltRowColor: string;
  @Column({ default: '#e5e7eb' }) tableBorderColor: string;
  @Column({ default: '#e5e7eb' }) borderColor: string;
  @Column({ default: '#FBBF24' }) balanceDueTextColor: string;

  // Typography
  @Column({ default: 'Helvetica' }) fontFamily: string;
  @Column({ default: 8 }) fontSize: number;
  @Column({ default: 24 }) headingFontSize: number;
  @Column({ default: 16 }) subheadingFontSize: number;
  @Column({ default: 8 }) labelFontSize: number;
  @Column({ default: 8 }) tableFontSize: number;
  @Column('float', { default: 1.5 }) lineHeight: number;
  @Column('float', { default: 0 }) letterSpacing: number;
  @Column({ default: 'normal' }) fontWeight: string; // 'normal' | 'bold' | 'light'
  @Column({ default: 'bold' }) headingFontWeight: string;

  // Logo
  @Column({ nullable: true }) logoUrl: string;
  @Column({ default: 150 }) logoWidth: number;
  @Column({ default: 50 }) logoHeight: number;
  @Column({ default: 'left' }) logoPosition: string; // 'left' | 'center' | 'right'
  @Column({ default: 0 }) logoMarginTop: number;
  @Column({ default: 10 }) logoMarginBottom: number;
  @Column({ default: true }) showLogo: boolean;

  // Branding
  @Column({ default: 'revolutic' }) brandName: string;
  @Column({ default: 'digital innovation leadership' }) tagline: string;

  // Border & Spacing
  @Column({ default: 'solid' }) borderStyle: string; // 'none' | 'solid' | 'dashed' | 'dotted'
  @Column({ default: 1 }) borderWidth: number;
  @Column({ default: 15 }) sectionSpacing: number;
  @Column({ default: 5 }) fieldSpacing: number;
  @Column({ default: 'solid' }) tableBorderStyle: string;

  // Text Labels
  @Column({ default: 'INVOICE' }) invoiceLabel: string;
  @Column({ default: 'Bill To' }) billToLabel: string;
  @Column({ default: 'Invoice#' }) invoiceNumberLabel: string;
  @Column({ default: 'Invoice Date' }) invoiceDateLabel: string;
  @Column({ default: 'Due Date' }) dueDateLabel: string;
  @Column({ default: 'Terms' }) termsLabel: string;
  @Column({ default: 'Item & Description' }) itemsLabel: string;
  @Column({ default: 'Description' }) descriptionLabel: string;
  @Column({ default: 'Hours' }) quantityLabel: string;
  @Column({ default: 'Rate' }) rateLabel: string;
  @Column({ default: 'Amount' }) amountLabel: string;
  @Column({ default: 'Sub Total' }) subtotalLabel: string;
  @Column({ default: 'Tax' }) taxLabel: string;
  @Column({ default: 'Discount' }) discountLabel: string;
  @Column({ default: 'Total' }) totalLabel: string;
  @Column({ default: 'Notes' }) notesLabel: string;
  @Column({ default: 'Previous Remaining' }) previousDueLabel: string;
  @Column({ default: 'Balance Due' }) balanceDueLabel: string;

  // Table Configuration
  @Column('jsonb', { default: [] })
  tableColumnSettings: {
    columnName: string;
    label?: string;
    visible: boolean;
    width: string;
    alignment: string;
  }[];

  @Column({ default: true }) showTableBorders: boolean;
  @Column({ default: true }) showTableHeader: boolean;
  @Column({ default: 'left' }) tableHeaderAlignment: string;
  @Column({ default: true }) alternateRowColors: boolean;

  // Field Visibility
  @Column({ default: true }) showInvoiceNumber: boolean;
  @Column({ default: true }) showInvoiceDate: boolean;
  @Column({ default: true }) showDueDate: boolean;
  @Column({ default: true }) showCustomerEmail: boolean;
  @Column({ default: true }) showCustomerPhone: boolean;
  @Column({ default: true }) showCustomerAddress: boolean;
  @Column({ default: true }) showItemDescription: boolean;
  @Column({ default: true }) showItemUnit: boolean;
  @Column({ default: true }) showSubtotal: boolean;
  @Column({ default: false }) showTax: boolean;
  @Column({ default: false }) showDiscount: boolean;
  @Column({ default: false }) showShipping: boolean;
  @Column({ default: true }) showNotes: boolean;
  @Column({ default: true }) showPreviousDue: boolean;

  // Header Section
  @Column({ nullable: true }) headerText: string;
  @Column({ default: 'center' }) headerAlignment: string;
  @Column({ default: 14 }) headerFontSize: number;
  @Column({ default: 'bold' }) headerFontWeight: string;
  @Column({ nullable: true }) headerBackgroundColor: string;
  @Column({ nullable: true }) headerHeight: number;
  @Column({ default: false }) showHeader: boolean;

  // Footer Section
  @Column({ nullable: true }) footerText: string;
  @Column({ default: 'center' }) footerAlignment: string;
  @Column({ default: 10 }) footerFontSize: number;
  @Column({ default: 'normal' }) footerFontWeight: string;
  @Column({ nullable: true }) footerBackgroundColor: string;
  @Column({ nullable: true }) footerHeight: number;
  @Column({ default: true }) showFooter: boolean;
  @Column({ default: false }) showPageNumbers: boolean;
  @Column({ default: 'Page {n} of {total}' }) pageNumberFormat: string;

  // Layout Options
  @Column({ default: false }) includePaymentStub: boolean;
  @Column({ default: 'bottom' }) paymentStubPosition: string; // 'bottom' | 'separatePage'
  @Column({ default: 'spacious' }) layoutStyle: string; // 'compact' | 'spacious' | 'custom'
  @Column({ default: 'left' }) contentAlignment: string; // 'left' | 'center' | 'justify'

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number; // For performance/easier access

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
