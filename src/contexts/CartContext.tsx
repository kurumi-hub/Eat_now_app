"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import type { ReactNode } from "react";

import {
  cartRestaurant as temporaryCartRestaurant,
  mockCartItems,
  mockRestaurantNote,
} from "@/components/cart/cartData";

export const CART_STORAGE_KEY = "eatnow-cart-v1";
export const CHECKOUT_STORAGE_KEY = "eatnow-checkout-v1";
export const ORDER_RECEIPT_STORAGE_KEY = "eatnow-order-receipt-v1";
export const ORDER_HISTORY_STORAGE_KEY = "eatnow-order-history-v1";
export const CART_DELIVERY_FEE = 15000;

export type CartRestaurant = {
  restaurantId: string;
  restaurantSlug: string;
  restaurantName: string;
};

export type CartItem = {
  foodId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export type AddCartItemInput = Omit<CartItem, "quantity"> & {
  quantity?: number;
};

export type AddCartItemResult = "ADDED" | "UPDATED" | "RESTAURANT_CONFLICT";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "delivering"
  | "completed"
  | "cancelled"
  | "rejected";

export type CheckoutSnapshot = {
  restaurant: CartRestaurant;
  items: CartItem[];
  restaurantNote: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  appliedVoucherCode: string | null;
  total: number;
  itemCount: number;
  preparedAt: string;
};

export type PaymentMethod = "cod" | "vnpay";

export type CreateOrderInput = {
  recipientName: string;
  phone: string;
  address: string;
  deliveryNote: string;
  restaurantNote: string;
  paymentMethod: PaymentMethod | "cod" | string;
  discount?: number;
  appliedVoucherCode?: string | null;
};

export type OrderReceipt = CheckoutSnapshot & {
  id: string;
  status: OrderStatus;
  recipientName: string;
  phone: string;
  address: string;
  deliveryNote: string;
  paymentMethod: PaymentMethod | "cod" | string;
  estimatedDeliveryLabel: string;
  createdAt: string;
};

type CartState = {
  restaurant: CartRestaurant | null;
  items: CartItem[];
  restaurantNote: string;
};

type CartAction =
  | {
      type: "ADD_ITEM";
      payload: {
        restaurant: CartRestaurant;
        item: CartItem;
      };
    }
  | {
      type: "INCREMENT_QUANTITY";
      payload: {
        foodId: string;
      };
    }
  | {
      type: "DECREMENT_QUANTITY";
      payload: {
        foodId: string;
      };
    }
  | {
      type: "REMOVE_ITEM";
      payload: {
        foodId: string;
      };
    }
  | {
      type: "SET_RESTAURANT_NOTE";
      payload: {
        restaurantNote: string;
      };
    }
  | {
      type: "RESTORE_CART";
      payload: CartState;
    }
  | {
      type: "CLEAR_CART";
    };

type StateUpdate<T> = T | ((current: T) => T);

type CartContextValue = {
  cart: CartState;
  checkoutSnapshot: CheckoutSnapshot | null;
  lastOrder: OrderReceipt | null;
  orderHistory: OrderReceipt[];
  itemCount: number;
  addItem: (
    restaurant: CartRestaurant,
    item: AddCartItemInput
  ) => AddCartItemResult;
  incrementQuantity: (foodId: string) => void;
  decrementQuantity: (foodId: string) => void;
  removeItem: (foodId: string) => void;
  updateRestaurantNote: (restaurantNote: string) => void;
  prepareCheckout: (restaurantNote?: string) => CheckoutSnapshot | null;
  createOrder: (input: CreateOrderInput) => OrderReceipt;
  getOrderById: (orderId: string) => OrderReceipt | null;
  clearCart: () => void;
  clearLastOrder: () => void;
};

const emptyCart: CartState = {
  restaurant: null,
  items: [],
  restaurantNote: "",
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function checkoutSnapshotReducer(
  state: CheckoutSnapshot | null,
  update: StateUpdate<CheckoutSnapshot | null>
) {
  return typeof update === "function" ? update(state) : update;
}

function lastOrderReducer(
  state: OrderReceipt | null,
  update: StateUpdate<OrderReceipt | null>
) {
  return typeof update === "function" ? update(state) : update;
}

function orderHistoryReducer(
  state: OrderReceipt[],
  update: StateUpdate<OrderReceipt[]>
) {
  return typeof update === "function" ? update(state) : update;
}

function normalizeQuantity(quantity: number | undefined) {
  return Math.max(1, quantity ?? 1);
}

function getCartSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getCartItemCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function buildCheckoutSnapshot(
  cart: CartState,
  restaurantNote = cart.restaurantNote
): CheckoutSnapshot | null {
  if (!cart.restaurant || cart.items.length === 0) {
    return null;
  }

  const subtotal = getCartSubtotal(cart.items);
  const deliveryFee = CART_DELIVERY_FEE;

  return {
    restaurant: cart.restaurant,
    items: cart.items.map((item) => ({ ...item })),
    restaurantNote,
    subtotal,
    deliveryFee,
    discount: 0,
    appliedVoucherCode: null,
    total: subtotal + deliveryFee,
    itemCount: getCartItemCount(cart.items),
    preparedAt: new Date().toISOString(),
  };
}

function buildTemporaryCheckoutSnapshot(
  restaurantNote = mockRestaurantNote
): CheckoutSnapshot {
  const items: CartItem[] = mockCartItems.map(
    ({ foodId, image, name, price, quantity }) => ({
      foodId,
      image,
      name,
      price,
      quantity,
    })
  );
  const subtotal = getCartSubtotal(items);

  return {
    restaurant: {
      restaurantId: temporaryCartRestaurant.id,
      restaurantSlug: temporaryCartRestaurant.slug,
      restaurantName: temporaryCartRestaurant.name,
    },
    items,
    restaurantNote,
    subtotal,
    deliveryFee: CART_DELIVERY_FEE,
    discount: 0,
    appliedVoucherCode: null,
    total: subtotal + CART_DELIVERY_FEE,
    itemCount: getCartItemCount(items),
    preparedAt: new Date().toISOString(),
  };
}

function createOrderId() {
  const randomSegment = Math.floor(1000 + Math.random() * 9000);

  return `EN-${randomSegment}`;
}

function isCartRestaurant(value: unknown): value is CartRestaurant {
  if (!value || typeof value !== "object") return false;

  const restaurant = value as CartRestaurant;

  return (
    typeof restaurant.restaurantId === "string" &&
    typeof restaurant.restaurantSlug === "string" &&
    typeof restaurant.restaurantName === "string"
  );
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;

  const item = value as CartItem;

  return (
    typeof item.foodId === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    typeof item.image === "string" &&
    typeof item.quantity === "number"
  );
}

function normalizeCartState(value: unknown): CartState | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as CartState;

  if (
    candidate.restaurant !== null &&
    !isCartRestaurant(candidate.restaurant)
  ) {
    return null;
  }

  if (!Array.isArray(candidate.items) || !candidate.items.every(isCartItem)) {
    return null;
  }

  return {
    restaurant: candidate.restaurant,
    items: candidate.items,
    restaurantNote:
      typeof candidate.restaurantNote === "string"
        ? candidate.restaurantNote
        : "",
  };
}

function isCheckoutSnapshot(value: unknown): value is CheckoutSnapshot {
  if (!value || typeof value !== "object") return false;

  const snapshot = value as CheckoutSnapshot;

  return (
    isCartRestaurant(snapshot.restaurant) &&
    Array.isArray(snapshot.items) &&
    snapshot.items.every(isCartItem) &&
    typeof snapshot.restaurantNote === "string" &&
    typeof snapshot.subtotal === "number" &&
    typeof snapshot.deliveryFee === "number" &&
    typeof snapshot.total === "number" &&
    typeof snapshot.itemCount === "number" &&
    typeof snapshot.preparedAt === "string"
  );
}

function isOrderReceipt(value: unknown): value is OrderReceipt {
  if (!isCheckoutSnapshot(value)) return false;

  const receipt = value as OrderReceipt;
  const validStatuses: OrderStatus[] = [
    "pending",
    "confirmed",
    "preparing",
    "delivering",
    "completed",
    "cancelled",
    "rejected",
  ];

  return (
    typeof receipt.id === "string" &&
    validStatuses.includes(receipt.status) &&
    typeof receipt.recipientName === "string" &&
    typeof receipt.phone === "string" &&
    typeof receipt.address === "string" &&
    typeof receipt.deliveryNote === "string" &&
    (receipt.paymentMethod === "cod" || receipt.paymentMethod === "vnpay") &&
    typeof receipt.estimatedDeliveryLabel === "string" &&
    typeof receipt.createdAt === "string"
  );
}

function readStoredCheckoutSnapshot() {
  if (typeof window === "undefined") return null;

  try {
    const storedCheckout = window.localStorage.getItem(CHECKOUT_STORAGE_KEY);

    if (!storedCheckout) return null;

    const parsedCheckout: unknown = JSON.parse(storedCheckout);

    if (!isCheckoutSnapshot(parsedCheckout)) return null;

    return {
      ...parsedCheckout,
      discount:
        typeof parsedCheckout.discount === "number"
          ? parsedCheckout.discount
          : 0,
      appliedVoucherCode:
        typeof parsedCheckout.appliedVoucherCode === "string"
          ? parsedCheckout.appliedVoucherCode
          : null,
    };
  } catch {
    window.localStorage.removeItem(CHECKOUT_STORAGE_KEY);
    return null;
  }
}

function readStoredOrderReceipt() {
  if (typeof window === "undefined") return null;

  try {
    const storedOrder = window.localStorage.getItem(ORDER_RECEIPT_STORAGE_KEY);

    if (!storedOrder) return null;

    const parsedOrder: unknown = JSON.parse(storedOrder);

    return isOrderReceipt(parsedOrder) ? parsedOrder : null;
  } catch {
    window.localStorage.removeItem(ORDER_RECEIPT_STORAGE_KEY);
    return null;
  }
}

function readStoredOrderHistory() {
  if (typeof window === "undefined") return [];

  try {
    const storedHistory = window.localStorage.getItem(ORDER_HISTORY_STORAGE_KEY);

    if (!storedHistory) return [];

    const parsedHistory: unknown = JSON.parse(storedHistory);

    return Array.isArray(parsedHistory)
      ? parsedHistory.filter(isOrderReceipt)
      : [];
  } catch {
    window.localStorage.removeItem(ORDER_HISTORY_STORAGE_KEY);
    return [];
  }
}

function addOrderToHistory(history: OrderReceipt[], order: OrderReceipt) {
  return [order, ...history.filter((item) => item.id !== order.id)];
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) => item.foodId === action.payload.item.foodId
      );

      if (existingItem) {
        return {
          ...state,
          restaurant: action.payload.restaurant,
          items: state.items.map((item) =>
            item.foodId === action.payload.item.foodId
              ? {
                  ...item,
                  quantity: item.quantity + action.payload.item.quantity,
                }
              : item
          ),
        };
      }

      return {
        ...state,
        restaurant: action.payload.restaurant,
        items: [...state.items, action.payload.item],
      };
    }

    case "INCREMENT_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.foodId === action.payload.foodId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      };

    case "DECREMENT_QUANTITY": {
      const nextItems = state.items
        .map((item) =>
          item.foodId === action.payload.foodId
            ? { ...item, quantity: Math.max(item.quantity - 1, 0) }
            : item
        )
        .filter((item) => item.quantity > 0);

      return nextItems.length > 0
        ? { ...state, items: nextItems }
        : emptyCart;
    }

    case "REMOVE_ITEM": {
      const nextItems = state.items.filter(
        (item) => item.foodId !== action.payload.foodId
      );

      return nextItems.length > 0
        ? { ...state, items: nextItems }
        : emptyCart;
    }

    case "SET_RESTAURANT_NOTE":
      return {
        ...state,
        restaurantNote: action.payload.restaurantNote,
      };

    case "RESTORE_CART":
      return action.payload;

    case "CLEAR_CART":
      return emptyCart;

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, emptyCart);
  const [checkoutSnapshot, setCheckoutSnapshot] =
    useReducer(checkoutSnapshotReducer, null);
  const [lastOrder, setLastOrder] = useReducer(lastOrderReducer, null);
  const [orderHistory, setOrderHistory] = useReducer(orderHistoryReducer, []);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);

      if (storedCart) {
        const parsedCart: unknown = JSON.parse(storedCart);
        const normalizedCart = normalizeCartState(parsedCart);

        if (normalizedCart) {
          dispatch({ type: "RESTORE_CART", payload: normalizedCart });
        }
      }

      setCheckoutSnapshot(readStoredCheckoutSnapshot());
      setLastOrder(readStoredOrderReceipt());
      setOrderHistory(readStoredOrderHistory());
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
      window.localStorage.removeItem(CHECKOUT_STORAGE_KEY);
      window.localStorage.removeItem(ORDER_RECEIPT_STORAGE_KEY);
      window.localStorage.removeItem(ORDER_HISTORY_STORAGE_KEY);
    } finally {
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    if (cart.items.length === 0) {
      window.localStorage.removeItem(CART_STORAGE_KEY);
      window.localStorage.removeItem(CHECKOUT_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!checkoutSnapshot) {
      window.localStorage.removeItem(CHECKOUT_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(
      CHECKOUT_STORAGE_KEY,
      JSON.stringify(checkoutSnapshot)
    );
  }, [checkoutSnapshot, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!lastOrder) {
      window.localStorage.removeItem(ORDER_RECEIPT_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(
      ORDER_RECEIPT_STORAGE_KEY,
      JSON.stringify(lastOrder)
    );
  }, [lastOrder, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;

    if (orderHistory.length === 0) {
      window.localStorage.removeItem(ORDER_HISTORY_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(
      ORDER_HISTORY_STORAGE_KEY,
      JSON.stringify(orderHistory)
    );
  }, [orderHistory, hasHydrated]);

  const itemCount = useMemo(() => getCartItemCount(cart.items), [cart.items]);

  const contextValue = useMemo<CartContextValue>(
    () => ({
      cart,
      checkoutSnapshot,
      lastOrder,
      orderHistory,
      itemCount,
      addItem: (restaurant, item) => {
        if (
          cart.restaurant &&
          cart.restaurant.restaurantId !== restaurant.restaurantId
        ) {
          return "RESTAURANT_CONFLICT";
        }

        const existingItem = cart.items.find(
          (cartItem) => cartItem.foodId === item.foodId
        );

        dispatch({
          type: "ADD_ITEM",
          payload: {
            restaurant,
            item: {
              ...item,
              quantity: normalizeQuantity(item.quantity),
            },
          },
        });

        return existingItem ? "UPDATED" : "ADDED";
      },
      incrementQuantity: (foodId) =>
        dispatch({ type: "INCREMENT_QUANTITY", payload: { foodId } }),
      decrementQuantity: (foodId) =>
        dispatch({ type: "DECREMENT_QUANTITY", payload: { foodId } }),
      removeItem: (foodId) =>
        dispatch({ type: "REMOVE_ITEM", payload: { foodId } }),
      updateRestaurantNote: (restaurantNote) =>
        dispatch({
          type: "SET_RESTAURANT_NOTE",
          payload: { restaurantNote },
        }),
      prepareCheckout: (restaurantNote = cart.restaurantNote) => {
        const snapshot = buildCheckoutSnapshot(cart, restaurantNote);

        if (snapshot) {
          setCheckoutSnapshot(snapshot);
        }

        return snapshot;
      },
      createOrder: (input) => {
        const snapshot =
          checkoutSnapshot ||
          buildCheckoutSnapshot(cart, input.restaurantNote) ||
          buildTemporaryCheckoutSnapshot(input.restaurantNote);

        const orderDiscount = input.discount ?? snapshot.discount ?? 0;
        const orderVoucherCode =
          input.appliedVoucherCode ?? snapshot.appliedVoucherCode ?? null;
        const orderTotal =
          snapshot.subtotal + snapshot.deliveryFee - orderDiscount;

        const receipt: OrderReceipt = {
          ...snapshot,
          restaurantNote: input.restaurantNote,
          id: createOrderId(),
          status: "pending",
          recipientName: input.recipientName,
          phone: input.phone,
          address: input.address,
          deliveryNote: input.deliveryNote,
          paymentMethod: input.paymentMethod,
          discount: orderDiscount,
          appliedVoucherCode: orderVoucherCode,
          total: orderTotal,
          estimatedDeliveryLabel: "15-20 phút",
          createdAt: new Date().toISOString(),
        };

        setLastOrder(receipt);
        setOrderHistory((currentHistory) =>
          addOrderToHistory(currentHistory, receipt)
        );
        setCheckoutSnapshot(null);
        dispatch({ type: "CLEAR_CART" });

        return receipt;
      },
      getOrderById: (orderId) =>
        orderHistory.find((order) => order.id === orderId) || null,
      clearCart: () => {
        setCheckoutSnapshot(null);
        dispatch({ type: "CLEAR_CART" });
      },
      clearLastOrder: () => setLastOrder(null),
    }),
    [cart, checkoutSnapshot, itemCount, lastOrder, orderHistory]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
