"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface DeletePropertyModalProps {
  propertyId: string;
  propertyName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DeletePropertyModal({
  propertyId,
  propertyName,
  isOpen,
  onClose,
}: DeletePropertyModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset confirm text when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setConfirmText("");
      setIsDeleting(false);
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && !isDeleting) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isDeleting, onClose]);

  // Handle click outside
  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget && !isDeleting) {
      onClose();
    }
  }

  if (!isOpen) return null;

  const isConfirmValid = confirmText === propertyName;

  async function handleDelete() {
    if (!isConfirmValid) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/admin/properties/${propertyId}/delete`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete property");
      }

      // Redirect to properties list
      router.push("/admin/properties");
      router.refresh();
    } catch (error) {
      console.error("Error deleting property:", error);
      alert(error instanceof Error ? error.message : "Failed to delete property");
      setIsDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Delete Property</h2>
          <p className="text-sm text-zinc-600 mb-4">
            This action cannot be undone. This will permanently delete the property{" "}
            <span className="font-semibold">{propertyName}</span> and all associated data.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              To confirm, type <span className="font-mono font-semibold">{propertyName}</span> in the box below:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={propertyName}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={isDeleting}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={!isConfirmValid || isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete Property"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
