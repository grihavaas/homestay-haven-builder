"use client";

import { useState } from "react";
import { DeletePropertyModal } from "./DeletePropertyModal";

interface DeletePropertyButtonProps {
  propertyId: string;
  propertyName: string;
}

export function DeletePropertyButton({
  propertyId,
  propertyName,
}: DeletePropertyButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
      >
        Delete Property
      </button>
      <DeletePropertyModal
        propertyId={propertyId}
        propertyName={propertyName}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
