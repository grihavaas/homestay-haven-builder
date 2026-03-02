"use client";

import { useRouter } from "next/navigation";
import { LanguageTagInput } from "./LanguageTagInput";
import { useState } from "react";

export function HostsForm({ 
  createHost,
  isOpen,
  onOpenChange,
}: { 
  createHost: (formData: FormData) => Promise<void>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [languages, setLanguages] = useState<string[]>([]);

  if (!isOpen) {
    return (
      <button
        onClick={() => onOpenChange(true)}
        className="rounded-md bg-black px-4 py-2 text-white"
      >
        Add Host
      </button>
    );
  }

  return (
    <form action={createHost} className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Add Host</h3>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="text-sm text-zinc-600 hover:underline"
        >
          Cancel
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <div className="text-sm font-medium">Name</div>
          <input
            name="name"
            className="mt-1 w-full rounded-md border px-3 py-2"
            required
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium">Title</div>
          <select
            name="title"
            defaultValue=""
            className="mt-1 w-full rounded-md border px-3 py-2"
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
          className="mt-1 w-full rounded-md border px-3 py-2"
          rows={2}
        />
      </label>

      <label className="block">
        <div className="text-sm font-medium">Write-up</div>
        <textarea
          name="writeup"
          className="mt-1 w-full rounded-md border px-3 py-2"
          rows={3}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <div className="text-sm font-medium">Email</div>
          <input
            name="email"
            type="email"
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium">Phone</div>
          <input
            name="phone"
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium">WhatsApp</div>
          <input
            name="whatsapp"
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
      </div>

      <label className="block">
        <div className="text-sm font-medium">Response Time</div>
        <select
          name="response_time"
          defaultValue=""
          className="mt-1 w-full rounded-md border px-3 py-2"
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
          className="rounded-md bg-black px-4 py-2 text-white"
          onClick={async (e) => {
            e.preventDefault();
            const form = e.currentTarget.closest("form");
            if (form) {
              const formData = new FormData(form);
              formData.set("languages", JSON.stringify(languages));
              await createHost(formData);
              setLanguages([]);
              onOpenChange(false);
              router.refresh();
            }
          }}
        >
          Add Host
        </button>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="rounded-md border px-4 py-2 text-zinc-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
