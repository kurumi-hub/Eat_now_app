export type HomeFlashSaleItem = {
  id: string;
  foodId: string;
  foodName: string;
  restaurantName: string;
  restaurantSlug: string;
  imageUrl: string | null;
  imageAlt: string;
  originalPrice: number;
  salePrice: number;
  stockLimit: number;
  soldQuantity: number;
  remainingQuantity: number;
};

export type HomeFlashSale = {
  id: string;
  name: string;
  subtitle: string;
  startsAt: string;
  endsAt: string;
  serverTime: string;
  items: HomeFlashSaleItem[];
};
