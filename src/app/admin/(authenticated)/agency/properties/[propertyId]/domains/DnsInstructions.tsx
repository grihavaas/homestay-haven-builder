"use client";

import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface DnsRecord {
  type: string;
  name: string;
  value: string;
}

interface DnsInstructionsProps {
  records: DnsRecord[];
}

export function DnsInstructions({ records }: DnsInstructionsProps) {
  const [open, setOpen] = useState(true);

  if (records.length === 0) return null;

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: text });
  }

  return (
    <div className="mt-2 rounded border border-orange-200 bg-orange-50 p-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm font-medium text-orange-800"
      >
        <span>DNS Records Required</span>
        <span className="text-xs">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div className="mt-2">
          <p className="mb-2 text-xs text-orange-700">
            Add these records at your domain registrar, then click &quot;Verify DNS&quot;.
          </p>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-orange-200 text-left">
                <th className="py-1 pr-2 font-medium">Type</th>
                <th className="py-1 pr-2 font-medium">Name</th>
                <th className="py-1 pr-2 font-medium">Value</th>
                <th className="py-1 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={i} className="border-b border-orange-100">
                  <td className="py-1 pr-2 font-mono">{r.type}</td>
                  <td className="py-1 pr-2 font-mono max-w-[150px] truncate">{r.name}</td>
                  <td className="py-1 pr-2 font-mono max-w-[200px] truncate">{r.value}</td>
                  <td className="py-1">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(r.value)}
                      className="text-orange-700 hover:text-orange-900 underline"
                    >
                      Copy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
