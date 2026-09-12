export type ChatRole = "user" | "assistant";

export type ChatFoodResult = {
  foodId: string;
  foodName: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  price: number;
  normalPrice: number;
  hasSizes: boolean;
  foodRating: number;
  restaurantName: string;
  restaurantRating: number;
  orderState: string;
  distanceKm: number | null;
  categories: string[];
  tags: string[];
  flashSaleItemId: string | null;
  flashSaleEndsAt: string | null;
  flashSaleRemaining: number | null;
  url: string;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  time?: string;
  results?: ChatFoodResult[];
  failed?: boolean;
};

export type ChatStreamEvent =
  | { type: "start"; requestId: string }
  | { type: "text"; text: string }
  | { type: "results"; items: ChatFoodResult[] }
  | { type: "error"; code: string; message: string; retryable: boolean }
  | { type: "done" };
