import { supabase, WORKER_URL } from "./supabase";

/**
 * Appels vers le Worker Cloudflare (agents IA). Authentifie chaque requete
 * avec le token de session Supabase courant — c'est ce que le Worker verifie
 * cote serveur (voir requireAuth dans stock-relate-worker/src/index.ts).
 */
async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new WorkerCallError("Session expirée — reconnectez-vous.");
  return { Authorization: `Bearer ${token}` };
}

export class WorkerCallError extends Error {}

export interface VoiceOrderDraft {
  transcript: string;
  intent: "purchase" | "balance_check" | "complaint" | "unknown";
  items: { productGuess: string; quantity: number }[];
  confidence: number;
}

export async function callTranscribe(audioBlob: Blob): Promise<VoiceOrderDraft> {
  const headers = await authHeader();
  const form = new FormData();
  form.append("audio", audioBlob, "recording.webm");

  const res = await fetch(`${WORKER_URL}/agents/transcribe`, { method: "POST", headers, body: form });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.success) throw new WorkerCallError(body?.message ?? `Échec (${res.status})`);
  return body.data as VoiceOrderDraft;
}

export interface InvoiceExtraction {
  supplierGuess: string;
  lines: { skuGuess: string; quantity: number; unitCost: number }[];
  rawConfidence: number;
}

export async function callVision(imageBase64: string, mimeType: string): Promise<InvoiceExtraction> {
  const headers = await authHeader();
  const res = await fetch(`${WORKER_URL}/agents/vision`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64, mimeType }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.success) throw new WorkerCallError(body?.message ?? `Échec (${res.status})`);
  return body.data as InvoiceExtraction;
}

export async function callTts(text: string): Promise<Blob> {
  const headers = await authHeader();
  const res = await fetch(`${WORKER_URL}/agents/tts`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new WorkerCallError(body?.message ?? `Échec (${res.status})`);
  }
  return res.blob();
}

/** Déclenche un vrai envoi WhatsApp (template approuvé Meta) — voir stock-relate-worker/src/lib/whatsapp.ts */
export async function callSendReminder(clientId: string): Promise<void> {
  const headers = await authHeader();
  const res = await fetch(`${WORKER_URL}/agents/send-reminder`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ clientId }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.success) throw new WorkerCallError(body?.message ?? `Échec (${res.status})`);
}

/** Convertit un fichier image en base64 brut (sans le préfixe data:...;base64,). */
export function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      resolve({ base64, mimeType: file.type || "image/jpeg" });
    };
    reader.onerror = () => reject(new Error("Lecture du fichier échouée."));
    reader.readAsDataURL(file);
  });
}
