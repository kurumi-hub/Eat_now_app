import { parseFinance, parseProposal } from "@/lib/data/adminFlashSales";
import type { OwnerFlashSaleWorkspace } from "@/types/flashSale";

type Row = Record<string, unknown>;
const rows = (value: unknown) => Array.isArray(value) ? value.filter((item): item is Row => Boolean(item) && typeof item === "object") : [];

export const EMPTY_OWNER_FLASH_SALES: OwnerFlashSaleWorkspace = {
  campaigns: [], foods: [], proposals: [],
  finance: { orders: 0, quantity: 0, discount: 0, platformFunded: 0, restaurantFunded: 0 },
};

export function parseOwnerFlashSales(value: unknown): OwnerFlashSaleWorkspace {
  if (!value || typeof value !== "object" || Array.isArray(value)) return EMPTY_OWNER_FLASH_SALES;
  const data = value as Row;
  return {
    campaigns: rows(data.campaigns).map((row) => ({
      id: String(row.id), name: String(row.name), startsAt: String(row.starts_at), endsAt: String(row.ends_at),
      status: String(row.status) as OwnerFlashSaleWorkspace["campaigns"][number]["status"],
    })),
    foods: rows(data.foods).map((row) => ({
      id: String(row.id), name: String(row.name), basePrice: Number(row.base_price),
      sizes: rows(row.sizes).map((size) => ({ id: String(size.id), name: String(size.name), price: Number(size.price) })),
    })),
    proposals: rows(data.proposals).map(parseProposal),
    finance: parseFinance(data.finance),
  };
}
