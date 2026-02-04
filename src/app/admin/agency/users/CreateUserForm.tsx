"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";

interface Tenant {
  id: string;
  name: string;
}

interface CreateUserFormProps {
  tenants: Tenant[];
  createUserAction: (formData: FormData) => Promise<void>;
}

export function CreateUserForm({ tenants, createUserAction }: CreateUserFormProps) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      formData.set("phone", phone);
      await createUserAction(formData);
      setPhone("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    await handleSubmit(formData);
  };

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-lg border p-4" aria-busy={isSubmitting}>
      <h3 className="font-medium">Create User & Assign to Tenant</h3>
      <p className="text-sm text-zinc-600">
        Create a new user account and assign them to a tenant. Provide either
        email or phone (or both). If the user already exists, they will just
        be assigned to the tenant.
      </p>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
      )}

      <fieldset disabled={isSubmitting} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <div className="text-sm font-medium">First Name</div>
            <input
              name="first_name"
              type="text"
              placeholder="John"
              className="mt-1 w-full rounded-md border px-3 py-2 disabled:opacity-50"
            />
          </label>
          <label className="block">
            <div className="text-sm font-medium">Last Name</div>
            <input
              name="last_name"
              type="text"
              placeholder="Doe"
              className="mt-1 w-full rounded-md border px-3 py-2 disabled:opacity-50"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <div className="text-sm font-medium">
              Email <span className="text-zinc-400">(optional if phone provided)</span>
            </div>
            <input
              name="email"
              type="email"
              placeholder="user@example.com"
              className="mt-1 w-full rounded-md border px-3 py-2 disabled:opacity-50"
            />
          </label>
          <div>
            <div className="text-sm font-medium">
              Phone <span className="text-zinc-400">(optional if email provided)</span>
            </div>
            <div className="mt-1">
              <PhoneInput
                value={phone}
                onChange={setPhone}
                placeholder="98765 43210"
              />
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Phone-only users can login via OTP.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <div className="text-sm font-medium">Tenant</div>
            <select
              name="tenant_id"
              className="mt-1 w-full rounded-md border px-3 py-2 disabled:opacity-50"
              required
            >
              <option value="">Select tenant</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <div className="text-sm font-medium">Role</div>
            <select
              name="role"
              className="mt-1 w-full rounded-md border px-3 py-2 disabled:opacity-50"
              required
            >
              <option value="">Select role</option>
              <option value="agency_rm">Relationship Manager</option>
              <option value="tenant_admin">Tenant Admin</option>
              <option value="tenant_editor">Tenant Editor</option>
            </select>
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <div className="text-sm font-medium">Password (for email users)</div>
            <input
              name="password"
              type="password"
              placeholder="Leave empty to send invitation"
              className="mt-1 w-full rounded-md border px-3 py-2 disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Required for email users unless sending invitation. Not needed for
              phone-only users.
            </p>
          </label>
          <div className="flex items-end pb-6">
            <label className="flex items-center gap-2">
              <input name="send_invite" type="checkbox" className="disabled:opacity-50" />
              <span className="text-sm">Send invitation email (email users only)</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[180px] justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                Creating...
              </>
            ) : (
              "Create User & Assign"
            )}
          </button>
          {isSubmitting && (
            <span className="text-sm text-zinc-500">Please wait…</span>
          )}
        </div>
      </fieldset>
    </form>
  );
}
