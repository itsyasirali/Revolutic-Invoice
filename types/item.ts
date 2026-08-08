// Item type enum (UI-only concept — the backend entity/DTOs below have no
// "type" column/field at all, so this value is never persisted or returned
// by the API; preserved as-is from the original frontend types)
export type ItemType = "Goods" | "Service";

// Main Item interface (UI-facing shape, matches the API's response shape)
export interface Item {
  id: number;
  type: ItemType;
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
  type: "success" | "error" | "warning" | "info";
  message: string;
}

// Hook Props types
export interface UseItemActionsProps {
  selectedIds: (string | number)[];
  setSelectedIds: (ids: (string | number)[]) => void;
  updateStatus: (
    ids: (string | number)[],
    status: "Active" | "inActive",
    callback: () => void,
  ) => Promise<void>;
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
  type?: ItemType;
  name?: string;
  unit?: string | null;
  sellingPrice?: number;
  description?: string;
  status?: "Active" | "inActive";
}

// --- Backend request payload shapes (mirrors api/src/items/dto/*) ---

export interface CreateItemPayload {
  name: string;
  unit: string;
  sellingPrice: number;
  description?: string;
  status?: string;
}

export type UpdateItemPayload = Partial<CreateItemPayload>;

export interface BatchUpdateItemPayload {
  status: string;
  items: string[];
}

export interface BatchDeleteItemPayload {
  items: string[];
}
