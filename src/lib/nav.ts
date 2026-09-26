import {
  LayoutDashboard,
  Boxes,
  ArrowLeftRight,
  Truck,
  Users,
  Wallet,
  Settings,
  Inbox,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  primary?: boolean; // affiché dans la barre basse mobile
}

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Pilote d'activité", icon: LayoutDashboard, primary: true },
  { href: "/inventory", label: "Inventaire", icon: Boxes, primary: true },
  { href: "/movements", label: "Mouvements", icon: ArrowLeftRight, primary: true },
  { href: "/clients", label: "Clients", icon: Users, primary: true },
  { href: "/escrow", label: "Fintech", icon: Wallet, primary: true },
  { href: "/drafts", label: "Brouillons WhatsApp", icon: Inbox },
  { href: "/suppliers", label: "Fournisseurs", icon: Truck },
  { href: "/settings", label: "Réglages", icon: Settings },
];

