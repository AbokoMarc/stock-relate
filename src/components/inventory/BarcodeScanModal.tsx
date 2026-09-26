"use client";

import { useEffect, useRef, useState } from "react";
import { X, ScanBarcode, AlertTriangle } from "lucide-react";

/**
 * Scan de code-barres via l'API navigateur native BarcodeDetector.
 *
 * Honnêteté sur le support : BarcodeDetector fonctionne sur Chrome/Edge
 * Android et desktop, mais PAS sur Safari/iOS (ni Firefox) à l'heure où
 * j'écris ceci. Plutôt que de faire semblant que ça marche partout, ou
 * d'ajouter une grosse dépendance (ex. @zxing/library, ~200 Ko) pour
 * combler ce trou, ce composant détecte le support et affiche clairement
 * "non disponible sur ce navigateur, saisissez le SKU à la main" quand ce
 * n'est pas supporté — plutôt qu'un bouton qui ne fait rien silencieusement.
 */
export default function BarcodeScanModal({
  onClose,
  onDetected,
}: {
  onClose: () => void;
  onDetected: (code: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const isSupported = typeof window !== "undefined" && "BarcodeDetector" in window;
    setSupported(isSupported);
    if (!isSupported) return;

    let stream: MediaStream | null = null;
    let raf: number;
    let stopped = false;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        // @ts-expect-error — BarcodeDetector n'est pas encore dans lib.dom.d.ts standard
        const detector = new window.BarcodeDetector({ formats: ["ean_13", "code_128", "qr_code", "upc_a"] });

        const tick = async () => {
          if (stopped || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length > 0) {
              onDetected(codes[0].rawValue);
              return; // on s'arrete au premier code trouve
            }
          } catch {
            // frame illisible, on retente au prochain tick
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        setError("Accès caméra refusé ou indisponible.");
      }
    }

    start();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-base-700 bg-base-900 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base text-paper flex items-center gap-2">
            <ScanBarcode className="h-4 w-4" /> Scanner un code-barres
          </h2>
          <button onClick={onClose} aria-label="Fermer" className="rounded-md p-1 text-paper/50">
            <X className="h-4 w-4" />
          </button>
        </div>

        {supported === false && (
          <p className="flex gap-2 rounded-md bg-alert-500/10 border border-alert-500/30 px-3 py-2.5 text-xs text-alert-500">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            Le scan par caméra n&apos;est pas disponible sur ce navigateur (Safari/iOS et Firefox ne
            supportent pas encore cette fonctionnalité). Saisissez le SKU manuellement dans la
            recherche.
          </p>
        )}
        {error && <p className="text-xs text-alert-500">{error}</p>}
        {supported && !error && (
          <video ref={videoRef} className="w-full rounded-lg bg-black aspect-video" muted playsInline />
        )}
      </div>
    </div>
  );
}
