import { Loader2 } from "lucide-react";

export function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
      <Loader2 className="h-6 w-6 animate-spin" />
      {label && <p className="mt-3 text-sm">{label}</p>}
    </div>
  );
}
