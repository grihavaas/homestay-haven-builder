"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/SubmitButton";

export function DeleteTenantButton({
  tenantId,
  tenantName,
  deleteAction,
}: {
  tenantId: string;
  tenantName: string;
  deleteAction: (formData: FormData) => void;
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-600">Delete {tenantName}?</span>
        <form action={deleteAction} className="inline">
          <input type="hidden" name="tenantId" value={tenantId} />
          <SubmitButton variant="destructive" pendingText="Deleting...">Confirm</SubmitButton>
        </form>
        <button
          type="button"
          onClick={() => setShowConfirm(false)}
          className="rounded bg-zinc-200 px-2 py-1 text-xs hover:bg-zinc-300"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setShowConfirm(true)}
      className="text-xs text-red-600 hover:underline"
    >
      Delete
    </button>
  );
}
