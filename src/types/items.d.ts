export interface Item {
  id: number;
  type: "Service" | "Goods";
  name: string;
  unit?: string;
  sellingPrice?: number;
  description?: string;
  status?: "Active" | "inActive";
  userId?: number;
}

// Alert/Notification state
export interface AlertState {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

// Hook Props types
// Hook Props types
export interface UseItemActionsProps {
  selectedIds: (string | number)[];
  setSelectedIds: (ids: (string | number)[]) => void;
  updateStatus: (ids: (string | number)[], status: "Active" | "inActive", callback: () => void) => Promise<void>;
  deleteItems: (ids: (string | number)[], callback: () => void) => Promise<void>;
  refetch: () => void;
  setOpenDropdownId?: (id: string | number | null) => void;
}

export interface UseItemDetailsProps {
  items: Item[];
  deleteItems: (ids: string[], callback: () => void) => Promise<void>;
  deleteLoading: boolean;
}

// Item form data
export interface ItemFormData {
  id?: number;
  type?: 'Goods' | 'Service';
  name?: string;
  unit?: string | null;
  sellingPrice?: number;
  description?: string;
  status?: 'Active' | 'inActive';
}
