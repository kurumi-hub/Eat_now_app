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
  fundingSource?: FlashSaleFundingSource;
};

export type FlashSaleFundingSource = "platform" | "restaurant" | "shared";

export type FlashSaleFinance = {
  orders: number;
  quantity: number;
  discount: number;
  platformFunded: number;
  restaurantFunded: number;
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
  fundingSource: FlashSaleFundingSource; platformFundingPercent: number;
  approvedProposalId: string | null;
};

export type AdminFlashSaleFood = {
  id: string; name: string; basePrice: number; restaurantId: string; restaurantName: string;
};

export type AdminFlashSaleData = {
  campaigns: AdminFlashSaleCampaign[];
  items: AdminFlashSaleItem[];
  foods: AdminFlashSaleFood[];
  proposals: FlashSaleProposal[];
  finance: FlashSaleFinance;
};

export type FlashSaleProposal = {
  id: string; campaignId: string; restaurantId: string; foodId: string;
  campaignName: string; restaurantName: string; foodName: string;
  proposedSalePrice: number; proposedStockLimit: number; proposedPerUserLimit: number;
  fundingSource: "restaurant" | "shared"; platformFundingPercent: number;
  note: string | null; status: "pending" | "approved" | "rejected" | "cancelled" | "expired";
  reviewNote: string | null; flashSaleItemId: string | null; createdAt: string;
  campaignStartsAt: string; campaignEndsAt: string;
};

export type OwnerFlashSaleWorkspace = {
  campaigns: Array<Pick<AdminFlashSaleCampaign, "id" | "name" | "startsAt" | "endsAt" | "status">>;
  foods: Array<{ id: string; name: string; basePrice: number; sizes: Array<{ id: string; name: string; price: number }> }>;
  proposals: FlashSaleProposal[];
  finance: FlashSaleFinance;
};
