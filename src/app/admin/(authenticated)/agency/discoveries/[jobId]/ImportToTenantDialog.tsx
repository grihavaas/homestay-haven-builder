"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { importPropertyFromJSON } from "@/lib/json-import-action";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { PropertyImportData } from "@/lib/json-import-schema";

type Tenant = { id: string; name: string };
type ImageEntry = NonNullable<PropertyImportData["images"]>[number];

type TransferProgress = {
  transferred: number;
  failed: number;
  total: number;
};

export function ImportToTenantDialog({
  jobId,
  tenants,
  images,
  propertyData,
  onClose,
  onImported,
}: {
  jobId: string;
  tenants: Tenant[];
  images: ImageEntry[];
  propertyData: PropertyImportData;
  onClose: () => void;
  onImported: () => void;
}) {
  const [tenantId, setTenantId] = useState("");
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState("");
  const [transferring, setTransferring] = useState(false);
  const [progress, setProgress] = useState<TransferProgress | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  function startPolling() {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/discoveries/${jobId}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.imageTransferProgress) {
          setProgress(data.imageTransferProgress);
        }

        if (data.imageTransferStatus === "completed") {
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
          const p = data.imageTransferProgress as TransferProgress | undefined;
          const msg = p
            ? `${p.transferred} images transferred${p.failed > 0 ? `, ${p.failed} failed` : ""}.`
            : "Images transferred.";
          toast({ title: "Images Ready", description: msg });
          setTransferring(false);
          onImported();
          onClose();
        }
      } catch {
        // Silently retry on next interval
      }
    }, 3000);
  }

  async function handleImport() {
    if (!tenantId) {
      toast({ title: "Error", description: "Select a tenant", variant: "destructive" });
      return;
    }

    setImporting(true);
    try {
      // Step 1: Claim import
      setStatus("Claiming import...");
      const claimRes = await fetch(`/api/discoveries/${jobId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId }),
      });

      if (!claimRes.ok) {
        const err = await claimRes.json();
        throw new Error(err.error || "Failed to claim import");
      }

      // Use the current UI data (includes any edits the user made)
      const jsonData = JSON.stringify(propertyData);

      // Step 3: Import to Supabase
      setStatus("Creating property...");
      const result = await importPropertyFromJSON(tenantId, jsonData);

      if (!result.success) {
        throw new Error(result.error || result.message || "Import failed");
      }

      // Step 4: Kick off async image transfer
      if (images.length > 0 && result.propertyId) {
        setStatus("Starting image transfer...");
        setImporting(false);
        setTransferring(true);
        setProgress({ transferred: 0, failed: 0, total: images.length });

        try {
          const supabase = createSupabaseBrowserClient();
          const { data: roomRows } = await supabase
            .from("rooms")
            .select("id, name")
            .eq("property_id", result.propertyId);

          const roomMap: Record<string, string> = {};
          for (const row of roomRows || []) {
            roomMap[row.name] = row.id;
          }

          const transferRes = await fetch(`/api/discoveries/${jobId}/transfer-images`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tenantId,
              propertyId: result.propertyId,
              roomMap,
              images: images.map((img) => ({
                s3Key: img.s3Key,
                mediaType: img.suggestedType,
                roomName: img.roomName,
                alt: img.alt,
              })),
            }),
          });

          if (!transferRes.ok) {
            throw new Error("Failed to start image transfer");
          }

          // Start polling for progress
          startPolling();
        } catch (imgErr) {
          console.error("Image transfer dispatch failed:", imgErr);
          setTransferring(false);
          toast({
            title: "Imported",
            description: "Property imported. Image transfer could not be started — upload them manually.",
          });
          onImported();
          onClose();
        }
      } else {
        // No images — done immediately
        toast({
          title: "Imported",
          description: result.message || "Property imported successfully.",
        });
        onImported();
        onClose();
      }
    } catch (err) {
      toast({
        title: "Import Failed",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
      setImporting(false);
    }
  }

  const done = progress ? progress.transferred + progress.failed : 0;
  const pct = progress && progress.total > 0 ? Math.round((done / progress.total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold">
          {transferring ? "Transferring Images" : "Import to Tenant"}
        </h2>

        {transferring && progress ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-zinc-600">
              Uploading images to your property...
            </p>
            <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-zinc-500">
              {progress.transferred} of {progress.total} transferred
              {progress.failed > 0 && (
                <span className="text-red-500"> ({progress.failed} failed)</span>
              )}
            </p>
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-zinc-600">
              Select the tenant to import this discovery to. This action can only be
              done once.
            </p>

            <label className="mt-4 block">
              <div className="text-sm font-medium">Tenant</div>
              <select
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2"
                disabled={importing}
              >
                <option value="">Select a tenant...</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={importing}
                className="rounded-md border px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={importing || !tenantId}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {importing ? (status || "Importing...") : "Import"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
