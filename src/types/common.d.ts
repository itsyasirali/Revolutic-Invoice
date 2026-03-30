import type { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

// Button Component Types
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link' | 'success' | 'warning';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}

// Input Component Types
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
    // Custom props
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: LucideIcon;
    rightIcon?: LucideIcon;
    fullWidth?: boolean;
    prefix?: string;
    showLabel?: boolean;

    // Explicitly typed standard input attributes for better intellisense
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
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    helperText?: string;
    options: SelectOption[];
    placeholder?: string;
    fullWidth?: boolean;
    showLabel?: boolean;
}

// Textarea Component Types
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
    resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

// Table Component Types
export interface TableColumn<T> {
    key: string;
    label: string;
    width?: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
    align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
    columns: TableColumn<T>[];
    data: T[];
    selectedIds: (string | number)[];
    onSelectAll: (checked: boolean) => void;
    onSelectRow: (id: string | number, checked: boolean) => void;
    loading?: boolean;
    emptyMessage?: string;
    getRowId: (item: T) => string | number;
    onRowClick?: (item: T) => void;
    rowActions?: (item: T) => React.ReactNode;
    showFilter?: boolean;
    showCheckbox?: boolean;
    sortKey?: string;
    sortDirection?: "asc" | "desc";
    onSortChange?: (key: string) => void;
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

// Dropdown Menu Component Types
export interface DropdownMenuItem {
    icon: LucideIcon;
    label: string;
    onClick: () => void;
    variant?: 'default' | 'danger';
    disabled?: boolean;
}

export interface DropdownMenuProps {
    items: DropdownMenuItem[];
    trigger: React.ReactNode;
    align?: 'left' | 'right';
}

// Card Component Types
export interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    bordered?: boolean;
    shadow?: 'none' | 'sm' | 'md' | 'lg';
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
