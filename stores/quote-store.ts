import { create } from "zustand";

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: string;
}

export interface QuoteCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  showAddress?: boolean;
}

export interface QuoteState {
  // Customer
  customer: QuoteCustomer | null;
  requestId: string | null;

  // Quote details
  title: string;
  issueDate: string;
  dueDate: string;
  items: QuoteItem[];
  salesTaxType: "percentage" | "fixed";
  salesTaxValue: string;
  notes: string;

  // Computed (stored for convenience)
  quoteNumber: string;
}

export interface QuoteActions {
  // Customer
  setCustomer: (customer: QuoteCustomer | null) => void;
  setRequestId: (requestId: string | null) => void;

  // Quote details
  setTitle: (title: string) => void;
  setIssueDate: (date: string) => void;
  setDueDate: (date: string) => void;
  setSalesTaxType: (type: "percentage" | "fixed") => void;
  setSalesTaxValue: (value: string) => void;
  setNotes: (notes: string) => void;

  // Items
  addItem: () => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, field: keyof QuoteItem, value: string | number) => void;
  reorderItems: (items: QuoteItem[]) => void;

  // Computed values
  getSubtotal: () => number;
  getTaxAmount: () => number;
  getTotal: () => number;

  // Reset
  reset: () => void;
  initializeWithData: (data: Partial<QuoteState>) => void;
}

export type QuoteStore = QuoteState & QuoteActions;

const generateId = () => Math.random().toString(36).substring(2, 9);

const generateQuoteNumber = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "QUO";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const getDefaultDueDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 30); // 30 days from now
  return date.toISOString().split("T")[0];
};

const defaultState: QuoteState = {
  customer: null,
  requestId: null,
  title: "",
  issueDate: getTodayDate(),
  dueDate: getDefaultDueDate(),
  items: [{ id: generateId(), description: "", quantity: 1, unitPrice: "" }],
  salesTaxType: "percentage",
  salesTaxValue: "20",
  notes: "",
  quoteNumber: generateQuoteNumber(),
};

export const useQuoteStore = create<QuoteStore>((set, get) => ({
  ...defaultState,

  // Customer
  setCustomer: (customer) => set({ customer }),
  setRequestId: (requestId) => set({ requestId }),

  // Quote details
  setTitle: (title) => set({ title }),
  setIssueDate: (issueDate) => set({ issueDate }),
  setDueDate: (dueDate) => set({ dueDate }),
  setSalesTaxType: (salesTaxType) => set({ salesTaxType }),
  setSalesTaxValue: (salesTaxValue) => set({ salesTaxValue }),
  setNotes: (notes) => set({ notes }),

  // Items
  addItem: () =>
    set((state) => ({
      items: [
        ...state.items,
        { id: generateId(), description: "", quantity: 1, unitPrice: "" },
      ],
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.length > 1 ? state.items.filter((item) => item.id !== id) : state.items,
    })),

  updateItem: (id, field, value) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    })),

  reorderItems: (items) => set({ items }),

  // Computed values
  getSubtotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => {
      const price = parseFloat(item.unitPrice) || 0;
      return sum + item.quantity * price;
    }, 0);
  },

  getTaxAmount: () => {
    const { salesTaxType, salesTaxValue } = get();
    const subtotal = get().getSubtotal();
    const taxValue = parseFloat(salesTaxValue) || 0;

    if (salesTaxType === "percentage") {
      return subtotal * (taxValue / 100);
    }
    return taxValue;
  },

  getTotal: () => {
    return get().getSubtotal() + get().getTaxAmount();
  },

  // Reset
  reset: () =>
    set({
      ...defaultState,
      title: "",
      quoteNumber: generateQuoteNumber(),
      issueDate: getTodayDate(),
      dueDate: getDefaultDueDate(),
      items: [{ id: generateId(), description: "", quantity: 1, unitPrice: "" }],
    }),

  initializeWithData: (data) =>
    set((state) => ({
      ...state,
      ...data,
      quoteNumber: data.quoteNumber || generateQuoteNumber(),
    })),
}));
