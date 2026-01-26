"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Domain {
  id: string;
  hostname: string;
  is_primary: boolean;
  verified_at: string | null;
  created_at: string;
}

interface DomainsManagerProps {
  domains: Domain[];
  updateDomain: (formData: FormData) => Promise<void>;
  deleteDomain: (formData: FormData) => Promise<void>;
}

export function DomainsManager({
  domains,
  updateDomain,
  deleteDomain,
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
    await updateDomain(formData);
    startTransition(() => {
      router.refresh();
      setEditingDomainId(null);
      setEditingDomain(null);
    });
  }

  const [deletingDomainId, setDeletingDomainId] = useState<string | null>(null);

  async function handleDelete(domainId: string) {
    setDeletingDomainId(domainId);
  }

  async function confirmDelete(formData: FormData) {
    await deleteDomain(formData);
    startTransition(() => {
      router.refresh();
      setDeletingDomainId(null);
    });
  }

  function cancelDelete() {
    setDeletingDomainId(null);
  }

  return (
    <div className="mt-8 rounded-lg border">
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 border-b bg-zinc-50 p-3 text-sm font-medium">
        <div>Hostname</div>
        <div>Primary</div>
        <div>Verified</div>
        <div>Actions</div>
      </div>
      <div className="divide-y">
        {domains.map((d) => (
          <div key={d.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 p-3 text-sm">
            {editingDomainId === d.id && editingDomain ? (
              <>
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
                    {d.verified_at ? "yes" : "no"}
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
              </>
            ) : (
              <>
                <div className="font-mono">{d.hostname}</div>
                <div className="flex items-center justify-center">{d.is_primary ? "yes" : "no"}</div>
                <div className="flex items-center justify-center">{d.verified_at ? "yes" : "no"}</div>
                <div className="flex items-center gap-2">
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
