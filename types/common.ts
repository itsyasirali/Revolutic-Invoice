import type * as React from 'react';
import type { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

// Button Component Types
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'link';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    rounded?: boolean;
}

// Input Component Types
export type InputVariant = 'default' | 'filled' | 'flushed' | 'outline';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'size'> {
    variant?: InputVariant;
    inputSize?: InputSize;
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: LucideIcon;
    rightIcon?: LucideIcon;
    fullWidth?: boolean;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    showLabel?: boolean;
    clearable?: boolean;
    onClear?: () => void;

    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local' | 'month' | 'week' | 'file' | 'hidden';
    placeholder?: string;
    value?: string | number | readonly string[];
    defaultValue?: string | number | readonly string[];
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    onFocus?: React.FocusEventHandler<HTMLInputElement>;
    name?: string;
    id?: string;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    autoComplete?: string;
    autoFocus?: boolean;
    maxLength?: number;
    minLength?: number;
    min?: string | number;
    max?: string | number;
    step?: string | number;
    pattern?: string;
    accept?: string;
    multiple?: boolean;
}

// Select Component Types
export interface SelectOption {
    label: string;
    value: string | number;
    disabled?: boolean;
    description?: string;
    icon?: LucideIcon;
}

export type SelectVariant = 'default' | 'filled' | 'outline';
export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
    variant?: SelectVariant;
    selectSize?: SelectSize;
    label?: string;
    error?: string;
    helperText?: string;
    options: SelectOption[];
    placeholder?: string;
    fullWidth?: boolean;
    showLabel?: boolean;
    leftIcon?: LucideIcon;
}

// Textarea Component Types
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    variant?: 'default' | 'filled' | 'outline';
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
    resize?: 'none' | 'vertical' | 'horizontal' | 'both';
    showCount?: boolean;
}

// Table Component Types
export type TableVariant = 'default' | 'striped' | 'bordered' | 'compact';

export interface TableColumn<T = unknown> {
    key: string;
    label: React.ReactNode;
    width?: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
    align?: 'left' | 'center' | 'right';
    className?: string;
}

export interface TablePaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize?: number;
    totalItems?: number;
    onPageChange: (page: number) => void;
}

export interface TableProps<T = unknown> {
    columns: TableColumn<T>[];
    data: T[];
    selectedIds?: (string | number)[];
    onSelectAll?: (checked: boolean) => void;
    onSelectRow?: (id: string | number, checked: boolean) => void;
    loading?: boolean;
    emptyMessage?: string;
    emptyIcon?: LucideIcon;
    getRowId?: (item: T) => string | number;
    onRowClick?: (item: T) => void;
    rowActions?: (item: T) => React.ReactNode;
    showFilter?: boolean;
    showCheckbox?: boolean;
    sortKey?: string;
    sortDirection?: "asc" | "desc";
    onSortChange?: (key: string) => void;
    variant?: TableVariant;
    pagination?: TablePaginationProps;
    className?: string;
}

// Tabs Component Types
export interface Tab {
    label: string;
    value: string;
    count?: number;
}

export interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (value: string) => void;
}

// Status Badge Component Types
export interface StatusBadgeProps {
    status: string;
    variant?: 'active' | 'inactive' | 'success' | 'danger' | 'warning' | 'info' | 'default';
}

// Badge Component Types
export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'gray' | 'outline' | 'default';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
    children?: React.ReactNode;
    label?: string;
    status?: string;
    variant?: BadgeVariant;
    size?: BadgeSize;
    dot?: boolean;
    icon?: LucideIcon;
    rounded?: boolean;
    className?: string;
}

// Dropdown Menu Component Types
export interface DropdownMenuItem {
    icon?: LucideIcon;
    label: string;
    onClick: () => void;
    variant?: 'default' | 'danger' | 'success' | 'warning';
    disabled?: boolean;
    description?: string;
    dividerBefore?: boolean;
}

export interface DropdownMenuProps {
    items: DropdownMenuItem[];
    trigger: React.ReactNode;
    align?: 'left' | 'right' | 'center';
    width?: string;
    className?: string;
}

// Modal / Dialog Component Types
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    subtitle?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    closeOnOutsideClick?: boolean;
    showCloseButton?: boolean;
    className?: string;
}

// Checkbox Component Types
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: React.ReactNode;
    description?: string;
    error?: string;
    checkboxSize?: 'sm' | 'md' | 'lg';
}

// Switch Component Types
export interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: React.ReactNode;
    description?: string;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

// Card Component Types
export type CardVariant = 'default' | 'flat' | 'outlined' | 'elevated' | 'glass';

export interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: CardVariant;
    padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    bordered?: boolean;
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    hoverable?: boolean;
    onClick?: () => void;
}

// Info Card Component Types
export interface InfoCardProps {
    icon: LucideIcon;
    label: string;
    value: string | React.ReactNode;
    variant?: 'default' | 'primary' | 'success' | 'warning';
    className?: string;
}

// Empty State Component Types
export interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    message: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

// Confirm Dialog Component Types
export interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'warning' | 'info' | 'success';
}

// Icon Button Component Types
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: LucideIcon;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    rounded?: boolean;
    label?: string; // for aria-label
}

// Loading Spinner Component Types
export interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'white' | 'gray';
    className?: string;
}

// Currency Display Component Types
export interface CurrencyDisplayProps {
    amount: number | string;
    currency?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}
