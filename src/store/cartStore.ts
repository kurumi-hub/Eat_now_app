import { create } from "zustand";
import { persist } from "zustand/middleware";

// ---------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------

export type CartToppingSelection = {
  id: string;
  name: string;
  price: number;
};

export type CartSizeSelection = {
  id: string;
  name: string;
  price: number;
};

export type CartLine = {
  lineId: string;
  foodId: string;
  foodName: string;
  foodImage: string;
  size?: CartSizeSelection;
  toppings: CartToppingSelection[];
  unitPrice: number;
  quantity: number;
  note?: string;
};

export type AddToCartInput = {
  restaurantId: string;
  restaurantName: string;
  foodId: string;
  foodName: string;
  foodImage: string;
  basePrice: number;
  size?: CartSizeSelection;
  toppings?: CartToppingSelection[];
  note?: string;
  quantity?: number;
};

type CartState = {
  ownerId: string | null;
  restaurantId: string | null;
  restaurantName: string | null;
  lines: CartLine[];

  bindOwner: (ownerId: string | null) => void;
  resetCartSession: () => void;
  addItem: (input: AddToCartInput) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  clearCart: () => void;

  // Trả về true nếu cart đang có món của quán khác (cần xác nhận trước khi addItem)
  hasConflictingRestaurant: (restaurantId: string) => boolean;

  totalItems: () => number;
  totalPrice: () => number;
};

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

/**
 * Sinh chữ ký duy nhất cho 1 tổ hợp (food + size + toppings + note) để biết
 * nên gộp quantity vào dòng đã có, hay tạo dòng mới trong giỏ.
 */
function buildSignature(
  foodId: string,
  sizeId: string | undefined,
  toppingIds: string[],
  note: string | undefined
) {
  const sortedToppingIds = [...toppingIds].sort();
  return `${foodId}|${sizeId ?? ""}|${sortedToppingIds.join(",")}|${
    note?.trim() ?? ""
  }`;
}

function lineSignature(line: CartLine) {
  return buildSignature(
    line.foodId,
    line.size?.id,
    line.toppings.map((t) => t.id),
    line.note
  );
}

function calcUnitPrice(
  basePrice: number,
  size: CartSizeSelection | undefined,
  toppings: CartToppingSelection[]
) {
  const base = size ? size.price : basePrice;
  const toppingsTotal = toppings.reduce((sum, t) => sum + t.price, 0);
  return base + toppingsTotal;
}

function generateLineId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // fallback đơn giản, đủ dùng cho id phía client
  return `line-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ---------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      ownerId: null,
      restaurantId: null,
      restaurantName: null,
      lines: [],

      bindOwner: (ownerId) => {
        if (get().ownerId === ownerId) {
          return;
        }

        // Không để giỏ của tài khoản trước xuất hiện ở tài khoản sau hoặc
        // ngoài phiên đăng nhập. Cart phía server vẫn do RPC quản lý riêng.
        set({
          ownerId,
          restaurantId: null,
          restaurantName: null,
          lines: [],
        });
      },

      resetCartSession: () => {
        set({
          ownerId: null,
          restaurantId: null,
          restaurantName: null,
          lines: [],
        });
      },

      addItem: (input) => {
        const {
          restaurantId,
          restaurantName,
          foodId,
          foodName,
          foodImage,
          basePrice,
          size,
          toppings = [],
          note,
          quantity = 1,
        } = input;

        const state = get();

        // Giỏ đang trống hoặc đang thuộc đúng quán này -> set/giữ nguyên.
        // Nếu đang thuộc quán khác, hàm này không tự xoá -- UI phải gọi
        // hasConflictingRestaurant() trước và hỏi xác nhận, rồi clearCart()
        // trước khi gọi addItem() lại.
        const isNewOrSameRestaurant =
          state.restaurantId === null || state.restaurantId === restaurantId;

        if (!isNewOrSameRestaurant) {
          throw new Error(
            "Giỏ hàng đang có món của quán khác. Gọi hasConflictingRestaurant() + clearCart() trước khi thêm."
          );
        }

        const signature = buildSignature(
          foodId,
          size?.id,
          toppings.map((t) => t.id),
          note
        );

        const existingLine = state.lines.find(
          (line) => lineSignature(line) === signature
        );

        if (existingLine) {
          set({
            lines: state.lines.map((line) =>
              line.lineId === existingLine.lineId
                ? { ...line, quantity: line.quantity + quantity }
                : line
            ),
          });
          return;
        }

        const unitPrice = calcUnitPrice(basePrice, size, toppings);

        const newLine: CartLine = {
          lineId: generateLineId(),
          foodId,
          foodName,
          foodImage,
          size,
          toppings,
          unitPrice,
          quantity,
          note,
        };

        set({
          restaurantId,
          restaurantName,
          lines: [...state.lines, newLine],
        });
      },

      updateQuantity: (lineId, quantity) => {
        if (quantity <= 0) {
          get().removeLine(lineId);
          return;
        }
        set({
          lines: get().lines.map((line) =>
            line.lineId === lineId ? { ...line, quantity } : line
          ),
        });
      },

      removeLine: (lineId) => {
        const remainingLines = get().lines.filter(
          (line) => line.lineId !== lineId
        );
        set({
          lines: remainingLines,
          // Giỏ hết món -> reset luôn restaurant để lần thêm tiếp theo
          // (dù cùng hay khác quán) không bị chặn bởi guard ở addItem.
          restaurantId: remainingLines.length === 0 ? null : get().restaurantId,
          restaurantName:
            remainingLines.length === 0 ? null : get().restaurantName,
        });
      },

      clearCart: () => {
        set({ restaurantId: null, restaurantName: null, lines: [] });
      },

      hasConflictingRestaurant: (restaurantId) => {
        const state = get();
        return (
          state.restaurantId !== null && state.restaurantId !== restaurantId
        );
      },

      totalItems: () => {
        return get().lines.reduce((sum, line) => sum + line.quantity, 0);
      },

      totalPrice: () => {
        return get().lines.reduce(
          (sum, line) => sum + line.unitPrice * line.quantity,
          0
        );
      },
    }),
    {
      name: "eatnow-cart", // localStorage key
      version: 1,
      migrate: (persistedState, version) => {
        if (version < 1) {
          // Bản cũ không có ownerId nên không thể xác định dữ liệu thuộc ai.
          // Xóa một lần để tránh lộ giỏ hàng giữa các tài khoản.
          return {
            ownerId: null,
            restaurantId: null,
            restaurantName: null,
            lines: [],
          };
        }

        return persistedState as CartState;
      },
      partialize: (state) => ({
        ownerId: state.ownerId,
        restaurantId: state.restaurantId,
        restaurantName: state.restaurantName,
        lines: state.lines,
      }),
    }
  )
);
