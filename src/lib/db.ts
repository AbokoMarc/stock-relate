import Dexie, { type Table } from "dexie";
import type {
  Product,
  Movement,
  Client,
  Supplier,
  EscrowTransaction,
  ActivityLogEntry,
  AgentSuggestion,
} from "./types";

/**
 * Base locale (IndexedDB via Dexie).
 *
 * Sert de cache de secours en LECTURE pour l'Inventaire quand Supabase est
 * injoignable (voir src/hooks/useProducts.ts), et de source de démo pour les
 * pages pas encore branchées sur Supabase (Clients, Fournisseurs, Escrow,
 * Dashboard — voir le README).
 *
 * Les Mouvements n'utilisent PAS ce cache : ils passent uniquement par la
 * fonction Postgres `create_movement` (atomique), sans repli hors-ligne —
 * voir src/hooks/useMovements.ts pour pourquoi.
 */
export interface OutboxEntry {
  id: string;
  kind: "product:create";
  payload: unknown;
  createdAt: string;
}

class StockRelateDB extends Dexie {
  products!: Table<Product, string>;
  movements!: Table<Movement, string>;
  clients!: Table<Client, string>;
  suppliers!: Table<Supplier, string>;
  escrow!: Table<EscrowTransaction, string>;
  activity!: Table<ActivityLogEntry, string>;
  suggestions!: Table<AgentSuggestion, string>;
  outbox!: Table<OutboxEntry, string>;

  constructor() {
    super("stock-relate");
    this.version(2).stores({
      products: "id, sku, category, name",
      movements: "id, productId, type, createdAt",
      clients: "id, name, city",
      suppliers: "id, name",
      escrow: "id, clientId, status, createdAt",
      activity: "id, createdAt",
      suggestions: "id, kind, createdAt",
      outbox: "id, kind, createdAt",
    });
  }
}

export const db = new StockRelateDB();

/** Ensemence la base locale avec des données de démonstration, une seule fois. */
export async function seedIfEmpty() {
  const count = await db.products.count();
  if (count > 0) return;

  const { seedProducts, seedMovements, seedClients, seedSuppliers, seedEscrow, seedActivity, seedSuggestions } =
    await import("./mock-data");

  await db.transaction(
    "rw",
    db.products,
    db.movements,
    db.clients,
    db.suppliers,
    db.escrow,
    db.activity,
    db.suggestions,
    async () => {
      await db.products.bulkAdd(seedProducts);
      await db.movements.bulkAdd(seedMovements);
      await db.clients.bulkAdd(seedClients);
      await db.suppliers.bulkAdd(seedSuppliers);
      await db.escrow.bulkAdd(seedEscrow);
      await db.activity.bulkAdd(seedActivity);
      await db.suggestions.bulkAdd(seedSuggestions);
    }
  );
}
