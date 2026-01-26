"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { Host } from "./HostsList";
import { LanguageTagInput } from "./LanguageTagInput";

interface HostRowProps {
  host: Host;
  isEditing: boolean;
  onEdit: (hostId: string | null) => void;
  updateHost: (formData: FormData) => Promise<void>;
  deleteHost: (formData: FormData) => Promise<void>;
}

export function HostRow({
  host,
  isEditing,
  onEdit,
  updateHost,
  deleteHost,
}: HostRowProps) {
  const router = useRouter();
  const [languages, setLanguages] = useState<string[]>(host.languages || []);
  
  // Reset languages when editing starts or host changes
  useEffect(() => {
    if (isEditing) {
      setLanguages(host.languages || []);
    }
  }, [isEditing, host.languages]);

  if (isEditing) {
    return (
      <div className="p-3">
        <form
          action={async (formData: FormData) => {
            formData.append("hostId", host.id);
            formData.set("languages", JSON.stringify(languages));
            await updateHost(formData);
            onEdit(null);
            router.refresh();
          }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Edit Host</h4>
            <button
              type="button"
              onClick={() => onEdit(null)}
              className="text-xs text-zinc-600 hover:underline"
            >
              Cancel
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <div className="text-sm font-medium">Name</div>
              <input
                name="name"
                defaultValue={host.name}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="block">
              <div className="text-sm font-medium">Title</div>
              <select
                name="title"
                defaultValue={host.title || ""}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="">Select title</option>
                <option value="Owner">Owner</option>
                <option value="Manager">Manager</option>
                <option value="Host">Host</option>
                <option value="Property Manager">Property Manager</option>
                <option value="Superhost">Superhost</option>
                <option value="Concierge">Concierge</option>
                <option value="Administrator">Administrator</option>
              </select>
            </label>
          </div>
          <label className="block">
            <div className="text-sm font-medium">Bio</div>
            <textarea
              name="bio"
              defaultValue={host.bio || ""}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              rows={2}
            />
          </label>
          <label className="block">
            <div className="text-sm font-medium">Write-up</div>
            <textarea
              name="writeup"
              defaultValue={host.writeup || ""}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              rows={3}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <div className="text-sm font-medium">Email</div>
              <input
                name="email"
                type="email"
                defaultValue={host.email || ""}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <div className="text-sm font-medium">Phone</div>
              <input
                name="phone"
                defaultValue={host.phone || ""}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <div className="text-sm font-medium">WhatsApp</div>
              <input
                name="whatsapp"
                defaultValue={host.whatsapp || ""}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="block">
            <div className="text-sm font-medium">Response Time</div>
            <select
              name="response_time"
              defaultValue={host.response_time || ""}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="">Select response time</option>
              <option value="Within 1 hour">Within 1 hour</option>
              <option value="Within 2 hours">Within 2 hours</option>
              <option value="Within 4 hours">Within 4 hours</option>
              <option value="Within 12 hours">Within 12 hours</option>
              <option value="Within 24 hours">Within 24 hours</option>
              <option value="Within 48 hours">Within 48 hours</option>
            </select>
          </label>
          <label className="block">
            <div className="text-sm font-medium mb-2">Languages Spoken</div>
            <LanguageTagInput
              value={languages}
              onChange={setLanguages}
              name="languages"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-black px-4 py-2 text-sm text-white"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => onEdit(null)}
              className="rounded-md border px-4 py-2 text-sm text-zinc-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-medium">{host.name}</div>
          {host.title && (
            <div className="text-sm text-zinc-600">{host.title}</div>
          )}
          {host.email && (
            <div className="text-xs text-zinc-500">{host.email}</div>
          )}
          {host.phone && (
            <div className="text-xs text-zinc-500">{host.phone}</div>
          )}
          {host.languages && host.languages.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {host.languages.map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs"
                >
                  {lang}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(host.id)}
            className="text-xs text-blue-600 hover:underline"
          >
            Edit
          </button>
          <form action={deleteHost}>
            <input type="hidden" name="hostId" value={host.id} />
            <button
              type="submit"
              className="text-xs text-red-600 hover:underline"
            >
              Delete
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
