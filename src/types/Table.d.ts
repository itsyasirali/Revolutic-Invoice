// ================= TYPES =================

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
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  loading?: boolean;
  emptyMessage?: string;
  getRowId: (item: T) => string;
  onRowClick?: (item: T) => void;
  rowActions?: (item: T) => React.ReactNode;
  showFilter?: boolean;
  showCheckbox?: boolean;
}
