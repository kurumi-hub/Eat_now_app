import type { AdminFlashSaleData } from "@/types/flashSale";

export const EMPTY_ADMIN_FLASH_SALES: AdminFlashSaleData = { campaigns: [], items: [], foods: [] };

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
    })),
    foods: rows(data.foods).map((row) => ({
      id: String(row.id), name: String(row.name), basePrice: Number(row.base_price),
      restaurantId: String(row.restaurant_id), restaurantName: String(row.restaurant_name),
    })),
  };
}
