import type { Product } from "./types";

/** Ligne brute renvoyee par Supabase (colonnes snake_case). */
export interface SupabaseProductRow {
  id: string;
  sku: string;
  name: string;
  category: string | null;
  cost_price: number;
  sell_price: number;
  daily_holding_cost: number;
  stock_yaounde: number;
  stock_douala: number;
  reorder_point: number;
  updated_at: string;
}

export function rowToProduct(row: SupabaseProductRow): Product {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    category: row.category ?? "Non classé",
    costPrice: row.cost_price,
    sellPrice: row.sell_price,
    dailyHoldingCost: row.daily_holding_cost,
    stock: { yaounde: row.stock_yaounde, douala: row.stock_douala },
    reorderPoint: row.reorder_point,
    updatedAt: row.updated_at,
  };
}
