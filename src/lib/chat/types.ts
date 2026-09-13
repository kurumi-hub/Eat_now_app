export type ChatRole = "user" | "assistant";

export type ChatFoodResult = {
  kind: "food";
  foodId: string;
  foodName: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  price: number;
  normalPrice: number;
  hasSizes: boolean;
  foodRating: number;
  restaurantId: string;
  restaurantSlug: string;
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

export type ChatRestaurantResult = {
  kind: "restaurant";
  restaurantId: string;
  restaurantSlug: string;
  restaurantName: string;
  address: string;
  imageUrl: string;
  imageAlt: string;
  rating: number;
  reviewCount: number;
  orderState: string;
  distanceKm: number | null;
  hasPromotion: boolean;
  hasFreeship: boolean;
  matchedFoods: string[];
  url: string;
};

export type ChatCatalogResult = ChatFoodResult | ChatRestaurantResult;

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  time?: string;
  results?: ChatCatalogResult[];
  failed?: boolean;
};

export type ChatStreamEvent =
  | { type: "start"; requestId: string }
  | { type: "text"; text: string }
  | { type: "results"; items: ChatCatalogResult[] }
  | { type: "error"; code: string; message: string; retryable: boolean }
  | { type: "done" };
