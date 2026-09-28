import type { Product } from "./types";

/** Ligne brute renvoyee par Supabase (colonnes snake_case, avec jointure fournisseur). */
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
  reserved_yaounde: number | null;
  reserved_douala: number | null;
  reorder_point: number;
  supplier_id: string | null;
  updated_at: string;
  suppliers?: { name: string; avg_lead_time_days: number } | null;
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
    reserved: { yaounde: row.reserved_yaounde ?? 0, douala: row.reserved_douala ?? 0 },
    reorderPoint: row.reorder_point,
    supplierId: row.supplier_id ?? undefined,
    supplierName: row.suppliers?.name,
    supplierLeadTimeDays: row.suppliers?.avg_lead_time_days,
    updatedAt: row.updated_at,
  };
}
