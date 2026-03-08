"use client";

import { useState } from "react";
import type { PropertyImportData } from "@/lib/json-import-schema";

type Property = PropertyImportData["property"];

/** Input that allows typing decimal numbers incrementally (e.g. "12." or "-0.") */
function DecimalInput({
  value,
  onCommit,
  className,
  disabled,
}: {
  value: number | undefined;
  onCommit: (n: number | undefined) => void;
  className?: string;
  disabled?: boolean;
}) {
  const [text, setText] = useState<string | null>(null);
  const display = text ?? (value != null ? String(value) : "");

  return (
    <input
      type="text"
      inputMode="decimal"
      value={display}
      onChange={(e) => {
        const v = e.target.value;
        // Allow intermediate states: empty, minus, dot, trailing dot, etc.
        if (v === "" || v === "-" || v === "." || v === "-.") {
          setText(v);
          if (v === "") onCommit(undefined);
          return;
        }
        // Allow valid partial decimals like "12." or "-0."
        if (/^-?\d*\.?\d*$/.test(v)) {
          setText(v);
          const n = Number(v);
          if (!isNaN(n) && !v.endsWith(".")) onCommit(n);
        }
      }}
      onBlur={() => {
        // Commit final value and clear local text
        if (text != null) {
          const n = Number(text);
          onCommit(text === "" || isNaN(n) ? undefined : n);
          setText(null);
        }
      }}
      className={className}
      disabled={disabled}
    />
  );
}

export function DiscoveryBasicInfo({
  property,
  onChange,
  disabled,
  errorPaths,
}: {
  property: Property;
  onChange: (property: Property) => void;
  disabled?: boolean;
  errorPaths?: Set<string>;
}) {
  function update(field: keyof Property, value: unknown) {
    onChange({ ...property, [field]: value || undefined });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <div className="text-sm font-medium">Name</div>
          <input
            value={property.name}
            onChange={(e) => update("name", e.target.value)}
            className={`mt-1 w-full rounded-md border px-3 py-2 ${errorPaths?.has("property.name") ? "border-red-500 bg-red-50" : ""}`}
            disabled={disabled}
            required
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium">Type</div>
          <select
            value={property.type ?? ""}
            onChange={(e) => update("type", e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2"
            disabled={disabled}
          >
            <option value="">Select type</option>
            <option value="Hotel">Hotel</option>
            <option value="Resort">Resort</option>
            <option value="Homestay">Homestay</option>
            <option value="Villa">Villa</option>
            <option value="Apartment">Apartment</option>
            <option value="Guest House">Guest House</option>
            <option value="Bed & Breakfast">Bed &amp; Breakfast</option>
            <option value="Inn">Inn</option>
            <option value="Lodge">Lodge</option>
            <option value="Cottage">Cottage</option>
            <option value="Cabin">Cabin</option>
            <option value="Boutique Hotel">Boutique Hotel</option>
            <option value="Heritage Hotel">Heritage Hotel</option>
          </select>
        </label>
      </div>

      <label className="block">
        <div className="text-sm font-medium">Tagline</div>
        <input
          value={property.tagline ?? ""}
          onChange={(e) => update("tagline", e.target.value)}
          className="mt-1 w-full rounded-md border px-3 py-2"
          disabled={disabled}
        />
      </label>

      <label className="block">
        <div className="text-sm font-medium">Description</div>
        <textarea
          value={property.description ?? ""}
          onChange={(e) => update("description", e.target.value)}
          className="mt-1 w-full rounded-md border px-3 py-2"
          rows={6}
          disabled={disabled}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <div className="text-sm font-medium">Slug</div>
          <input
            value={property.slug}
            onChange={(e) => update("slug", e.target.value)}
            className={`mt-1 w-full rounded-md border px-3 py-2 font-mono text-sm ${errorPaths?.has("property.slug") ? "border-red-500 bg-red-50" : ""}`}
            disabled={disabled}
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium">Classification</div>
          <select
            value={property.classification ?? ""}
            onChange={(e) => update("classification", e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2"
            disabled={disabled}
          >
            <option value="">Select classification</option>
            <option value="1 Star">1 Star</option>
            <option value="2 Star">2 Star</option>
            <option value="3 Star">3 Star</option>
            <option value="4 Star">4 Star</option>
            <option value="5 Star">5 Star</option>
            <option value="Luxury">Luxury</option>
            <option value="Boutique">Boutique</option>
            <option value="Budget">Budget</option>
            <option value="Economy">Economy</option>
            <option value="Mid-Range">Mid-Range</option>
            <option value="Upscale">Upscale</option>
          </select>
        </label>
      </div>

      <label className="block">
        <div className="text-sm font-medium">Street Address</div>
        <input
          value={property.street_address ?? ""}
          onChange={(e) => update("street_address", e.target.value)}
          className="mt-1 w-full rounded-md border px-3 py-2"
          disabled={disabled}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <div className="text-sm font-medium">City</div>
          <input
            value={property.city ?? ""}
            onChange={(e) => update("city", e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2"
            disabled={disabled}
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium">State</div>
          <input
            value={property.state ?? ""}
            onChange={(e) => update("state", e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2"
            disabled={disabled}
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium">Country</div>
          <input
            value={property.country ?? ""}
            onChange={(e) => update("country", e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2"
            disabled={disabled}
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <div className="text-sm font-medium">Postal Code</div>
          <input
            value={property.postal_code ?? ""}
            onChange={(e) => update("postal_code", e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2"
            disabled={disabled}
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium">Location Description</div>
          <input
            value={property.location_description ?? ""}
            onChange={(e) => update("location_description", e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2"
            disabled={disabled}
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <div className="text-sm font-medium">Latitude</div>
          <DecimalInput
            value={property.latitude}
            onCommit={(n) => update("latitude", n)}
            className={`mt-1 w-full rounded-md border px-3 py-2 ${errorPaths?.has("property.latitude") ? "border-red-500 bg-red-50" : ""}`}
            disabled={disabled}
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium">Longitude</div>
          <DecimalInput
            value={property.longitude}
            onCommit={(n) => update("longitude", n)}
            className={`mt-1 w-full rounded-md border px-3 py-2 ${errorPaths?.has("property.longitude") ? "border-red-500 bg-red-50" : ""}`}
            disabled={disabled}
          />
        </label>
      </div>
    </div>
  );
}
