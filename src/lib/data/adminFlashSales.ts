import type { AdminFlashSaleData } from "@/types/flashSale";

export const EMPTY_ADMIN_FLASH_SALES: AdminFlashSaleData = {
  campaigns: [], items: [], foods: [], proposals: [],
  finance: { orders: 0, quantity: 0, discount: 0, platformFunded: 0, restaurantFunded: 0 },
};

type Row = Record<string, unknown>;
const rows = (value: unknown) => Array.isArray(value) ? value.filter((item): item is Row => Boolean(item) && typeof item === "object") : [];

export function parseAdminFlashSales(value: unknown): AdminFlashSaleData {
  if (!value || typeof value !== "object") return EMPTY_ADMIN_FLASH_SALES;
  const data = value as Row;
  return {
    campaigns: rows(data.campaigns).map((row) => ({
      id: String(row.id), name: String(row.name), subtitle: row.subtitle ? String(row.subtitle) : null,
      startsAt: String(row.starts_at), endsAt: String(row.ends_at),
      status: String(row.status) as AdminFlashSaleData["campaigns"][number]["status"],
      voucherPolicy: String(row.voucher_policy) as AdminFlashSaleData["campaigns"][number]["voucherPolicy"],
      fundingSource: String(row.funding_source) as AdminFlashSaleData["campaigns"][number]["fundingSource"],
    })),
    items: rows(data.items).map((row) => ({
      id: String(row.id), campaignId: String(row.campaign_id), foodId: String(row.food_id),
      foodName: String(row.food_name), restaurantName: String(row.restaurant_name),
      originalPrice: Number(row.original_price), salePrice: Number(row.sale_price),
      stockLimit: Number(row.stock_limit), soldQuantity: Number(row.sold_quantity),
      reservedQuantity: Number(row.reserved_quantity), perUserLimit: Number(row.per_user_limit),
      displayOrder: Number(row.display_order), isActive: row.is_active === true,
      fundingSource: String(row.funding_source ?? "platform") as AdminFlashSaleData["items"][number]["fundingSource"],
      platformFundingPercent: Number(row.platform_funding_percent ?? 100),
      approvedProposalId: row.approved_proposal_id ? String(row.approved_proposal_id) : null,
    })),
    foods: rows(data.foods).map((row) => ({
      id: String(row.id), name: String(row.name), basePrice: Number(row.base_price),
      restaurantId: String(row.restaurant_id), restaurantName: String(row.restaurant_name),
    })),
    proposals: rows(data.proposals).map(parseProposal),
    finance: parseFinance(data.finance),
  };
}

export function parseProposal(row: Row): AdminFlashSaleData["proposals"][number] {
  return {
    id: String(row.id), campaignId: String(row.campaign_id), restaurantId: String(row.restaurant_id), foodId: String(row.food_id),
    campaignName: String(row.campaign_name), restaurantName: String(row.restaurant_name ?? ""), foodName: String(row.food_name),
    proposedSalePrice: Number(row.proposed_sale_price), proposedStockLimit: Number(row.proposed_stock_limit),
    proposedPerUserLimit: Number(row.proposed_per_user_limit), fundingSource: String(row.funding_source) as "restaurant" | "shared",
    platformFundingPercent: Number(row.platform_funding_percent), note: row.note ? String(row.note) : null,
    status: String(row.status) as AdminFlashSaleData["proposals"][number]["status"],
    reviewNote: row.review_note ? String(row.review_note) : null,
    flashSaleItemId: row.flash_sale_item_id ? String(row.flash_sale_item_id) : null,
    createdAt: String(row.created_at),
  };
}

export function parseFinance(value: unknown): AdminFlashSaleData["finance"] {
  const row = value && typeof value === "object" && !Array.isArray(value) ? value as Row : {};
  return {
    orders: Number(row.orders ?? 0), quantity: Number(row.quantity ?? 0), discount: Number(row.discount ?? 0),
    platformFunded: Number(row.platform_funded ?? 0), restaurantFunded: Number(row.restaurant_funded ?? 0),
  };
}
