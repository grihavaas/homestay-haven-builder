"use client";

import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { importPropertyFromJSON } from "@/lib/json-import-action";

type Tenant = { id: string; name: string };

export function ImportToTenantDialog({
  jobId,
  tenants,
  onClose,
  onImported,
}: {
  jobId: string;
  tenants: Tenant[];
  onClose: () => void;
  onImported: () => void;
}) {
  const [tenantId, setTenantId] = useState("");
  const [importing, setImporting] = useState(false);

  async function handleImport() {
    if (!tenantId) {
      toast({ title: "Error", description: "Select a tenant", variant: "destructive" });
      return;
    }

    setImporting(true);
    try {
      // Step 1: Claim import at the backend (atomic one-time gate)
      const claimRes = await fetch(`/api/discoveries/${jobId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId }),
      });

      if (!claimRes.ok) {
        const err = await claimRes.json();
        throw new Error(err.error || "Failed to claim import");
      }

      const claimData = await claimRes.json();

      // Step 2: Fetch the extracted JSON from the pre-signed URL
      if (!claimData.extractedJsonUrl) {
        throw new Error("No extracted JSON available for this discovery");
      }

      const jsonRes = await fetch(claimData.extractedJsonUrl);
      if (!jsonRes.ok) {
        throw new Error("Failed to fetch extracted JSON");
      }
      const jsonData = await jsonRes.text();

      // Step 3: Import to Supabase via server action
      const result = await importPropertyFromJSON(tenantId, jsonData);

      if (!result.success) {
        throw new Error(result.error || result.message || "Import failed");
      }

      toast({
        title: "Imported",
        description: result.message || "Property imported successfully.",
      });

      onImported();
      onClose();
    } catch (err) {
      toast({
        title: "Import Failed",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold">Import to Tenant</h2>
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
            {importing ? "Importing..." : "Import"}
          </button>
        </div>
      </div>
    </div>
  );
}
