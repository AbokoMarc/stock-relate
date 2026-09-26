"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Supplier } from "@/lib/types";

interface SupplierRow {
  id: string;
  name: string;
  phone: string | null;
  city: string | null;
  avg_lead_time_days: number;
  amount_owed: number;
}

function rowToSupplier(r: SupplierRow): Supplier {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone ?? "",
    city: r.city ?? "",
    avgLeadTimeDays: r.avg_lead_time_days,
    amountOwed: r.amount_owed,
  };
}

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase.from("suppliers").select("*").order("name");
    if (error) {
      setError(error.message);
      return;
    }
    setError(null);
    setSuppliers((data as SupplierRow[]).map(rowToSupplier));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { suppliers, error, refresh };
}
