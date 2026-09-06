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
  voucherPolicy: "none" | "shipping_only" | "all";
  items: HomeFlashSaleItem[];
};

export type FoodFlashSale = {
  id: string;
  campaignId: string;
  campaignName: string;
  startsAt: string;
  endsAt: string;
  serverTime: string;
  originalPrice: number;
  salePrice: number;
  remainingQuantity: number;
  perUserLimit: number;
  voucherPolicy: "none" | "shipping_only" | "all";
};

export type AdminFlashSaleCampaign = {
  id: string; name: string; subtitle: string | null; startsAt: string; endsAt: string;
  status: "draft" | "active" | "paused" | "ended";
  voucherPolicy: "none" | "shipping_only" | "all";
  fundingSource: "platform" | "restaurant" | "shared";
};

export type AdminFlashSaleItem = {
  id: string; campaignId: string; foodId: string; foodName: string; restaurantName: string;
  originalPrice: number; salePrice: number; stockLimit: number; soldQuantity: number;
  reservedQuantity: number; perUserLimit: number; displayOrder: number; isActive: boolean;
};

export type AdminFlashSaleFood = {
  id: string; name: string; basePrice: number; restaurantId: string; restaurantName: string;
};

export type AdminFlashSaleData = {
  campaigns: AdminFlashSaleCampaign[];
  items: AdminFlashSaleItem[];
  foods: AdminFlashSaleFood[];
};
