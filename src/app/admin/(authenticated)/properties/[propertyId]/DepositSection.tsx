"use client";

import { useState, useEffect } from "react";

export function DepositSection({
  depositType,
  depositValue,
}: {
  depositType?: string | null;
  depositValue?: number | null;
}) {
  const [type, setType] = useState(depositType || "percentage");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const checkbox = document.getElementById("deposit_required") as HTMLInputElement;
    if (checkbox) {
      setShow(checkbox.checked);
      checkbox.addEventListener("change", () => {
        setShow(checkbox.checked);
      });
    }
  }, []);

  if (!show) return null;

  return (
    <div className="mt-3 space-y-3">
      <label className="block">
        <div className="text-sm font-medium">Deposit Type</div>
        <select
          name="deposit_type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mt-1 w-full rounded-md border px-3 py-2"
        >
          <option value="percentage">Percentage</option>
          <option value="nights">Number of Nights</option>
        </select>
      </label>
      <label className="block">
        <div className="text-sm font-medium">
          {type === "nights" ? "Number of Nights" : "Deposit Percentage"}
        </div>
        <input
          name="deposit_value"
          type="number"
          min="0"
          max={type === "nights" ? undefined : "100"}
          step={type === "nights" ? "1" : "0.01"}
          defaultValue={depositValue || ""}
          className="mt-1 w-full rounded-md border px-3 py-2"
          placeholder={type === "nights" ? "e.g., 1" : "e.g., 25"}
        />
      </label>
    </div>
  );
}
