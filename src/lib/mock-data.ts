import type {
  Product,
  Movement,
  Client,
  Supplier,
  EscrowTransaction,
  ActivityLogEntry,
  AgentSuggestion,
} from "./types";

const now = () => new Date().toISOString();
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

export const seedProducts: Product[] = [
  {
    id: "p1",
    sku: "PXL9P-256",
    name: "Google Pixel 9 Pro 256Go",
    category: "Téléphonie",
    costPrice: 385000,
    sellPrice: 465000,
    dailyHoldingCost: 800,
    stock: { yaounde: 6, douala: 2 },
    reserved: { yaounde: 0, douala: 0 },
    reorderPoint: 5,
    updatedAt: now(),
  },
  {
    id: "p2",
    sku: "ARM-CLB100",
    name: "Parfum Armaf Club de Nuit 100ml",
    category: "Cosmétique",
    costPrice: 6500,
    sellPrice: 11000,
    dailyHoldingCost: 35,
    stock: { yaounde: 0, douala: 48 },
    reserved: { yaounde: 0, douala: 0 },
    reorderPoint: 15,
    updatedAt: now(),
  },
  {
    id: "p3",
    sku: "SPK-JBL-GO3",
    name: "Enceinte JBL Go 3",
    category: "Électronique",
    costPrice: 14000,
    sellPrice: 21500,
    dailyHoldingCost: 60,
    stock: { yaounde: 22, douala: 30 },
    reserved: { yaounde: 0, douala: 0 },
    reorderPoint: 10,
    updatedAt: now(),
  },
  {
    id: "p4",
    sku: "HUI-3L",
    name: "Huile végétale 3L (carton de 4)",
    category: "Alimentaire",
    costPrice: 9200,
    sellPrice: 11500,
    dailyHoldingCost: 90,
    stock: { yaounde: 140, douala: 95 },
    reserved: { yaounde: 0, douala: 0 },
    reorderPoint: 40,
    updatedAt: now(),
  },
];

export const seedMovements: Movement[] = [
  {
    id: "m1",
    type: "in",
    productId: "p1",
    quantity: 10,
    to: "yaounde",
    source: "vision-ai",
    note: "Bon de livraison Tech-Distri Africa (photo)",
    createdAt: daysAgo(4),
  },
  {
    id: "m2",
    type: "out",
    productId: "p2",
    quantity: 12,
    from: "douala",
    source: "whatsapp-voice",
    note: "Commande vocale — Boutique Akwa Beauty",
    createdAt: daysAgo(1),
  },
  {
    id: "m3",
    type: "transfer",
    productId: "p1",
    quantity: 4,
    from: "yaounde",
    to: "douala",
    source: "manual",
    createdAt: daysAgo(2),
  },
];

export const seedClients: Client[] = [
  {
    id: "c1",
    name: "Boutique Akwa Beauty",
    phone: "+237 6 77 12 34 56",
    city: "douala",
    creditScore: 82,
    creditLimit: 500000,
    outstandingBalance: 120000,
    lastContactAt: daysAgo(1),
  },
  {
    id: "c2",
    name: "Grossiste Marc — Mokolo",
    phone: "+237 6 90 45 22 11",
    city: "yaounde",
    creditScore: 91,
    creditLimit: 1200000,
    outstandingBalance: 0,
    lastContactAt: daysAgo(5),
  },
  {
    id: "c3",
    name: "Isaac Électronique",
    phone: "+237 6 55 78 90 12",
    city: "douala",
    creditScore: 58,
    creditLimit: 200000,
    outstandingBalance: 185000,
    lastContactAt: daysAgo(9),
  },
];

export const seedSuppliers: Supplier[] = [
  {
    id: "s1",
    name: "Tech-Distri Africa",
    phone: "+237 6 99 00 11 22",
    city: "Douala",
    avgLeadTimeDays: 6,
    amountOwed: 1450000,
  },
  {
    id: "s2",
    name: "Armaf Import Dubai",
    phone: "+971 50 123 4567",
    city: "Dubaï",
    avgLeadTimeDays: 18,
    amountOwed: 320000,
  },
];

export const seedEscrow: EscrowTransaction[] = [
  {
    id: "e1",
    clientId: "c1",
    orderRef: "CMD-1042",
    amount: 66000,
    operator: "orange",
    status: "paid_awaiting_delivery",
    createdAt: daysAgo(0.4),
    updatedAt: daysAgo(0.2),
  },
  {
    id: "e2",
    clientId: "c3",
    orderRef: "CMD-1039",
    amount: 43000,
    operator: "mtn",
    status: "released",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(2.8),
  },
];

export const seedActivity: ActivityLogEntry[] = [
  { id: "a1", actor: "ai", message: "Brouillon de commande créé depuis un vocal WhatsApp (Boutique Akwa Beauty).", createdAt: daysAgo(1) },
  { id: "a2", actor: "system", message: "Stock Parfum Armaf 100ml sous le seuil de réassort à Douala.", createdAt: daysAgo(0.5) },
  { id: "a3", actor: "Marc", message: "Transfert de 4 Pixel 9 Pro validé vers Douala.", createdAt: daysAgo(2) },
];

export const seedSuggestions: AgentSuggestion[] = [
  {
    id: "sg1",
    kind: "reorder",
    title: "Rupture prévue sous 4 jours — Pixel 9 Pro",
    detail: "Vitesse de vente actuelle : 2/jour à Yaoundé. Stock restant : 6. Proposer une commande de 15 unités à Tech-Distri Africa.",
    productId: "p1",
    createdAt: daysAgo(0.2),
  },
  {
    id: "sg2",
    kind: "collections",
    title: "Relance recommandée — Isaac Électronique",
    detail: "185 000 FCFA en attente depuis 9 jours. Le client est habituellement actif sur WhatsApp vers 19h30.",
    createdAt: daysAgo(0.1),
  },
  {
    id: "sg3",
    kind: "price_drop",
    title: "Rotation lente — Enceintes JBL Go 3 (Douala)",
    detail: "30 unités en stock depuis 21 jours. Baisse suggérée de 8% pour libérer l'espace de l'entrepôt.",
    productId: "p3",
    createdAt: daysAgo(1.5),
  },
];
