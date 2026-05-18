import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  inventoryId: string;
  medicineId: string;
  medicineName: string;
  genericName: string;
  concentration?: string;
  presentation?: string;
  price: number;
  quantity: number;
  stockAvailable: number;
  imageUrl?: string;
  requiresPrescription: boolean;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (inventoryId: string) => void;
  updateQuantity: (inventoryId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.inventoryId === item.inventoryId
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.inventoryId === item.inventoryId
                  ? {
                      ...i,
                      quantity: Math.min(
                        i.quantity + item.quantity,
                        i.stockAvailable
                      ),
                    }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },

      removeItem: (inventoryId) => {
        set((state) => ({
          items: state.items.filter((i) => i.inventoryId !== inventoryId),
        }));
      },

      updateQuantity: (inventoryId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(inventoryId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.inventoryId === inventoryId
              ? { ...i, quantity: Math.min(quantity, i.stockAvailable) }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
    }),
    { name: "pharmacy-cart" }
  )
);

export const useCartCount = () =>
  useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));

export const useCartTotal = () =>
  useCartStore((s) => s.items.reduce((sum, i) => sum + i.price * i.quantity, 0));

interface CartUIState {
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartUIStore = create<CartUIState>()((set) => ({
  cartOpen: false,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
}));
