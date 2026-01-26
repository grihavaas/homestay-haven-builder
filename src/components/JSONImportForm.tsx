"use client";

import { useState, useRef, DragEvent, ChangeEvent, useTransition } from "react";
import { useRouter } from "next/navigation";
import { importPropertyFromJSON } from "@/lib/json-import-action";

interface JSONImportFormProps {
  tenantId: string;
}

export function JSONImportForm({ tenantId }: JSONImportFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [jsonData, setJsonData] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileRead = (fileContent: string, fileName: string) => {
    try {
      // Validate it's valid JSON
      JSON.parse(fileContent);
      setJsonData(fileContent);
      setError(null);
      console.log(`Loaded ${fileName}`);
    } catch (err) {
      setError(`Invalid JSON file: ${fileName}. Please check the file format.`);
    }
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      setError("Please upload a .json file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      handleFileRead(content, file.name);
    };
    reader.onerror = () => {
      setError("Failed to read file");
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      setError("Please drop a .json file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleFileRead(content, file.name);
    };
    reader.onerror = () => {
      setError("Failed to read file");
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!jsonData.trim()) {
      setError("Please paste JSON data or upload a JSON file");
      return;
    }

    startTransition(async () => {
      try {
        const result = await importPropertyFromJSON(tenantId, jsonData);

        if (result.success && result.propertyId) {
          setSuccess(result.message || "Property imported successfully!");
          setJsonData("");
          setShowForm(false);
          // Redirect to the new property
          setTimeout(() => {
            router.push(`/admin/properties/${result.propertyId}`);
            router.refresh();
          }, 2000);
        } else {
          // Show both error and detailed message if available
          const errorMessage = result.message
            ? `${result.error}\n\n${result.message}`
            : result.error || "Failed to import property";
          setError(errorMessage);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      }
    });
  };

  const loadSampleData = () => {
    fetch("/sample-property-data.json")
      .then((res) => res.text())
      .then((text) => {
        setJsonData(text);
      })
      .catch((err) => {
        setError("Failed to load sample data");
      });
  };

  if (!showForm) {
    return (
      <div className="mt-6 rounded-lg border border-dashed border-green-300 bg-green-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Import from JSON</h3>
            <p className="mt-1 text-sm text-zinc-600">
              Upload a JSON file or paste property data to quickly populate all fields
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Import JSON
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Import Property from JSON</h3>
        <button
          type="button"
          onClick={() => {
            setShowForm(false);
            setError(null);
            setSuccess(null);
            setJsonData("");
          }}
          className="text-sm text-zinc-600 hover:text-zinc-900"
          disabled={isPending}
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          <pre className="whitespace-pre-wrap font-sans">{error}</pre>
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
            isDragging
              ? "border-green-500 bg-green-50"
              : "border-zinc-300 bg-zinc-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isPending}
          />

          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-zinc-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm font-medium text-green-600 hover:text-green-700 underline"
                disabled={isPending}
              >
                Choose a JSON file
              </button>
              <p className="text-xs text-zinc-500">or drag and drop</p>
            </div>
            <p className="text-xs text-zinc-400">
              {jsonData ? "✓ File loaded - scroll down to review" : "JSON file up to 10MB"}
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-zinc-700">
              Property JSON Data
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadSampleData}
                className="text-xs text-green-600 hover:text-green-800 underline"
                disabled={isPending}
              >
                Load Sample
              </button>
              <a
                href="/sample-property-data.json"
                download
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Download Sample
              </a>
            </div>
          </div>
          <p className="text-xs text-zinc-500 mb-3">
            Upload a file above, paste JSON here, or load the sample. See{" "}
            <code className="bg-zinc-100 px-1 py-0.5 rounded text-xs">
              sample-property-data.json
            </code>{" "}
            for the complete structure.
          </p>
          <textarea
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            placeholder='{"property": {"name": "...", "country": "..."}, "rooms": [...], ...}'
            className="w-full h-64 rounded-md border border-zinc-300 px-3 py-2 text-sm font-mono focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            disabled={isPending}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending || !jsonData.trim()}
            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-zinc-400 disabled:cursor-not-allowed"
          >
            {isPending ? "Importing..." : "Import Property"}
          </button>
          {isPending && (
            <p className="text-sm text-zinc-600">Importing property data...</p>
          )}
        </div>

        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-xs text-green-800">
          <p className="font-medium mb-1">JSON Structure:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Required:</strong> property.name, property.country, property.slug
            </li>
            <li>
              <strong>Optional sections:</strong> rooms, hosts, review_sources,
              proximity_info, nearby_attractions, property_features,
              booking_settings, special_offers, rules_and_policies,
              social_media_links, payment_methods, booking_ctas
            </li>
            <li>
              <strong>Junction tables:</strong> property_amenities (array of
              strings), property_tags (array of strings)
            </li>
          </ul>
        </div>
      </form>
    </div>
  );
}
