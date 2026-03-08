"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { DnsInstructions } from "./DnsInstructions";

interface DnsRecord {
  type: string;
  name: string;
  value: string;
}

interface Domain {
  id: string;
  hostname: string;
  is_primary: boolean;
  verified_at: string | null;
  created_at: string;
  domain_status: "pending_vercel" | "pending_dns" | "verified" | "error";
  dns_records: DnsRecord[];
  vercel_error: string | null;
}

interface DomainsManagerProps {
  domains: Domain[];
  updateDomain: (formData: FormData) => Promise<void>;
  deleteDomain: (formData: FormData) => Promise<void>;
  verifyDomain: (formData: FormData) => Promise<void>;
  retryVercel: (formData: FormData) => Promise<void>;
}

function StatusBadge({ domain }: { domain: Domain }) {
  switch (domain.domain_status) {
    case "pending_vercel":
      return (
        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
          Registering...
        </span>
      );
    case "pending_dns":
      return (
        <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">
          DNS Required
        </span>
      );
    case "verified":
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
          Verified
        </span>
      );
    case "error":
      return (
        <span
          className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800"
          title={domain.vercel_error ?? "Unknown error"}
        >
          Error
        </span>
      );
  }
}

export function DomainsManager({
  domains,
  updateDomain,
  deleteDomain,
  verifyDomain,
  retryVercel,
}: DomainsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingDomainId, setEditingDomainId] = useState<string | null>(null);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);

  function handleEdit(domain: Domain) {
    setEditingDomain(domain);
    setEditingDomainId(domain.id);
  }

  function handleCancel() {
    setEditingDomain(null);
    setEditingDomainId(null);
  }

  async function handleUpdateSubmit(formData: FormData) {
    try {
      await updateDomain(formData);
      startTransition(() => {
        router.refresh();
        setEditingDomainId(null);
        setEditingDomain(null);
      });
    } catch (err) {
      console.error("Save error:", err);
      toast({
        title: "Error",
        description: "Failed to update domain. Please try again.",
        variant: "destructive",
      });
    }
  }

  const [deletingDomainId, setDeletingDomainId] = useState<string | null>(null);

  async function handleDelete(domainId: string) {
    setDeletingDomainId(domainId);
  }

  async function confirmDelete(formData: FormData) {
    try {
      await deleteDomain(formData);
      startTransition(() => {
        router.refresh();
        setDeletingDomainId(null);
      });
    } catch (err) {
      console.error("Delete error:", err);
      toast({
        title: "Error",
        description: "Failed to delete domain. Please try again.",
        variant: "destructive",
      });
    }
  }

  function cancelDelete() {
    setDeletingDomainId(null);
  }

  async function handleVerify(formData: FormData) {
    try {
      await verifyDomain(formData);
      startTransition(() => router.refresh());
      toast({ title: "DNS check complete", description: "Page refreshed with latest status." });
    } catch (err) {
      console.error("Verify error:", err);
      toast({
        title: "Error",
        description: "Failed to verify DNS. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function handleRetry(formData: FormData) {
    try {
      await retryVercel(formData);
      startTransition(() => router.refresh());
      toast({ title: "Retry complete", description: "Domain re-registered on Vercel." });
    } catch (err) {
      console.error("Retry error:", err);
      toast({
        title: "Error",
        description: "Failed to retry. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="mt-8 rounded-lg border">
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 border-b bg-zinc-50 p-3 text-sm font-medium">
        <div>Hostname</div>
        <div>Primary</div>
        <div>Status</div>
        <div>Actions</div>
      </div>
      <div className="divide-y">
        {domains.map((d) => (
          <div key={d.id}>
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 p-3 text-sm">
              {editingDomainId === d.id && editingDomain ? (
                <form action={handleUpdateSubmit} className="contents">
                  <input type="hidden" name="domainId" value={d.id} />
                  <input
                    name="hostname"
                    defaultValue={editingDomain.hostname}
                    className="rounded-md border px-2 py-1 font-mono text-sm"
                    required
                  />
                  <label className="flex items-center justify-center">
                    <input
                      name="is_primary"
                      type="checkbox"
                      defaultChecked={editingDomain.is_primary}
                      className="rounded"
                    />
                  </label>
                  <div className="flex items-center justify-center">
                    <StatusBadge domain={d} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isPending ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isPending}
                      className="px-2 py-1 text-xs border rounded hover:bg-zinc-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="font-mono">{d.hostname}</div>
                  <div className="flex items-center justify-center">
                    {d.is_primary ? "yes" : "no"}
                  </div>
                  <div className="flex items-center justify-center">
                    <StatusBadge domain={d} />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {d.domain_status === "pending_dns" && (
                      <form action={handleVerify} className="inline">
                        <input type="hidden" name="domainId" value={d.id} />
                        <button
                          type="submit"
                          disabled={isPending}
                          className="px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
                        >
                          Verify DNS
                        </button>
                      </form>
                    )}
                    {d.domain_status === "error" && (
                      <form action={handleRetry} className="inline">
                        <input type="hidden" name="domainId" value={d.id} />
                        <button
                          type="submit"
                          disabled={isPending}
                          className="px-2 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
                        >
                          Retry
                        </button>
                      </form>
                    )}
                    <button
                      type="button"
                      onClick={() => handleEdit(d)}
                      className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Edit
                    </button>
                    {deletingDomainId === d.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-600">Delete?</span>
                        <form action={confirmDelete} className="inline">
                          <input type="hidden" name="domainId" value={d.id} />
                          <button
                            type="submit"
                            disabled={isPending}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            Confirm
                          </button>
                        </form>
                        <button
                          type="button"
                          onClick={cancelDelete}
                          disabled={isPending}
                          className="px-2 py-1 text-xs border rounded hover:bg-zinc-50 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDelete(d.id)}
                        className="px-2 py-1 text-xs text-red-600 hover:text-red-800 underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
            {d.domain_status === "pending_dns" &&
              d.dns_records &&
              d.dns_records.length > 0 && (
                <div className="px-3 pb-3">
                  <DnsInstructions records={d.dns_records} />
                </div>
              )}
            {d.domain_status === "error" && d.vercel_error && (
              <div className="px-3 pb-3">
                <div className="rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                  {d.vercel_error}
                </div>
              </div>
            )}
          </div>
        ))}
        {domains.length === 0 ? (
          <div className="p-3 text-sm text-zinc-600">
            No domains yet. Add apex and www.
          </div>
        ) : null}
      </div>
    </div>
  );
}
