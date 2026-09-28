export type Warehouse = "yaounde" | "douala";

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  costPrice: number; // FCFA, prix d'achat
  sellPrice: number; // FCFA, prix de vente
  dailyHoldingCost: number; // FCFA/jour — coût d'immobilisation (Dynamic P&L)
  stock: Record<Warehouse, number>;
  reserved: Record<Warehouse, number>; // unités réservées (commande en cours), saisie manuelle
  reorderPoint: number;
  supplierId?: string;
  supplierName?: string; // jointure, pour affichage direct dans le tableau
  supplierLeadTimeDays?: number;
  updatedAt: string; // ISO
}

export type MovementType = "in" | "out" | "transfer";

export interface Movement {
  id: string;
  type: MovementType;
  productId: string;
  quantity: number;
  from?: Warehouse;
  to?: Warehouse;
  note?: string;
  source: "manual" | "whatsapp-voice" | "vision-ai";
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  city: Warehouse;
  creditScore: number; // 0-100, calculé (mock) à partir de l'historique
  creditLimit: number; // FCFA
  outstandingBalance: number; // FCFA dus
  lastContactAt?: string;
  slug?: string; // identifiant du portail public (/portal/<slug> sur le Worker)
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  city: string;
  avgLeadTimeDays: number;
  amountOwed: number; // FCFA
}

export type EscrowStatus =
  | "pending_payment"
  | "momo_push_sent"
  | "paid_awaiting_delivery"
  | "released"
  | "refunded"
  | "failed";

export interface EscrowTransaction {
  id: string;
  clientId: string;
  orderRef: string;
  amount: number; // FCFA
  operator: "mtn" | "orange";
  status: EscrowStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLogEntry {
  id: string;
  actor: "system" | "ai" | string; // nom d'utilisateur ou agent
  message: string;
  createdAt: string;
}

export interface AgentSuggestion {
  id: string;
  kind: "reorder" | "price_drop" | "collections" | "delivery_reassign";
  title: string;
  detail: string;
  productId?: string;
  createdAt: string;
}
