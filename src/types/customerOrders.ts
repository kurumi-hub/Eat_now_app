export type CustomerOrderSummary = {
  id: string;
  code: string;
  status: string;
  deliveryStatus: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
  restaurant: {
    id: string;
    slug: string;
    name: string;
    address: string;
    imageUrl?: string;
  };
  delivery: { receiver: string; phone: string; address: string };
  payment: { method: string; status: string };
  pricing: { subtotal: number; shippingFee: number; discount: number; total: number };
  items: Array<{
    id: string;
    foodId?: string;
    name: string;
    size?: string;
    quantity: number;
    lineTotal: number;
    note?: string;
    imageUrl?: string;
  }>;
};

export type CustomerOrderList = {
  items: CustomerOrderSummary[];
  total: number;
  limit: number;
  offset: number;
};

export type CustomerOrderEvent = {
  id: string;
  eventType: string;
  fromOrderStatus?: string;
  toOrderStatus?: string;
  fromDeliveryStatus?: string;
  toDeliveryStatus?: string;
  source: string;
  note?: string;
  createdAt: string;
};

export type CustomerOrderJourney = {
  orderId: string;
  code: string;
  status: string;
  deliveryStatus: string;
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
  preparingAt?: string;
  readyAt?: string;
  shipperAssignedAt?: string;
  shipperArrivedAt?: string;
  pickupConfirmationRequestedAt?: string;
  pickupConfirmedAt?: string;
  pickedUpAt?: string;
  proofSubmittedAt?: string;
  deliveredAt?: string;
  cancelReason?: string;
  incidentStatus: string;
  incidentReason?: string;
  responseDueAt?: string;
  preparationDueAt?: string;
  restaurantImageUrl?: string;
  itemImages: Array<{ orderItemId: string; foodId?: string; imageUrl?: string }>;
  events: CustomerOrderEvent[];
};
