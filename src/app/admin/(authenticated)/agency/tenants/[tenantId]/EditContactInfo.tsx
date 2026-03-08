"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";

interface EditContactInfoProps {
  tenantId: string;
  tenantName: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  updateAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}

export function EditContactInfo({
  tenantId,
  tenantName,
  contactName,
  contactEmail,
  contactPhone,
  updateAction,
}: EditContactInfoProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(tenantName);
  const [cName, setCName] = useState(contactName ?? "");
  const [cEmail, setCEmail] = useState(contactEmail ?? "");
  const [cPhone, setCPhone] = useState(contactPhone ?? "");

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("tenantId", tenantId);
      fd.set("name", name);
      fd.set("primary_contact_name", cName);
      fd.set("primary_contact_email", cEmail);
      fd.set("primary_contact_phone", cPhone);
      const result = await updateAction(fd);
      if (!result.success) {
        setError(result.error ?? "Failed to update");
      } else {
        setEditing(false);
        router.refresh();
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className="mt-6 rounded-lg border bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-700">Contact Information</h2>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
        </div>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
          <div>
            <span className="text-zinc-500">Name:</span>{" "}
            <span className="text-zinc-900">{contactName ?? "---"}</span>
          </div>
          <div>
            <span className="text-zinc-500">Email:</span>{" "}
            <span className="text-zinc-900">{contactEmail ?? "---"}</span>
          </div>
          <div>
            <span className="text-zinc-500">Phone:</span>{" "}
            <span className="text-zinc-900">{contactPhone ?? "---"}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-lg border bg-white p-4">
      <h2 className="text-sm font-medium text-zinc-700">Edit Contact Information</h2>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <div className="mt-3 space-y-3">
        <label className="block">
          <span className="text-xs font-medium text-zinc-500">Customer Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            required
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="text-xs font-medium text-zinc-500">Contact Name</span>
            <input
              value={cName}
              onChange={(e) => setCName(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-zinc-500">Contact Email</span>
            <input
              value={cEmail}
              onChange={(e) => setCEmail(e.target.value)}
              type="email"
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-zinc-500">Contact Phone</span>
            <input
              value={cPhone}
              onChange={(e) => setCPhone(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setError(null);
              setName(tenantName);
              setCName(contactName ?? "");
              setCEmail(contactEmail ?? "");
              setCPhone(contactPhone ?? "");
            }}
            disabled={saving}
            className="rounded-md border px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
