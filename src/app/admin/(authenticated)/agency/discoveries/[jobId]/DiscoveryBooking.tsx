"use client";

import type { PropertyImportData } from "@/lib/json-import-schema";

type BookingSettings = NonNullable<PropertyImportData["booking_settings"]>;

export function DiscoveryBooking({
  settings,
  onChange,
  disabled,
}: {
  settings: BookingSettings;
  onChange: (settings: BookingSettings) => void;
  disabled?: boolean;
}) {
  function update(field: keyof BookingSettings, value: unknown) {
    // Normalize time fields to HH:MM:SS format for schema compatibility
    if ((field === "check_in_time" || field === "check_out_time") && typeof value === "string" && value) {
      value = value.length === 5 ? `${value}:00` : value;
    }
    onChange({ ...settings, [field]: value || undefined });
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">Booking Settings</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Configure booking policies and requirements.
      </p>

      <div className="mt-6 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <div className="text-sm font-medium">Check-in Time</div>
            <input
              type="time"
              value={settings.check_in_time ?? ""}
              onChange={(e) => update("check_in_time", e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2"
              disabled={disabled}
            />
          </label>
          <label className="block">
            <div className="text-sm font-medium">Check-out Time</div>
            <input
              type="time"
              value={settings.check_out_time ?? ""}
              onChange={(e) => update("check_out_time", e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2"
              disabled={disabled}
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <div className="text-sm font-medium">Minimum Stay (nights)</div>
            <input
              type="number"
              min="1"
              value={settings.min_stay_nights ?? ""}
              onChange={(e) => update("min_stay_nights", e.target.value ? Number(e.target.value) : undefined)}
              className="mt-1 w-full rounded-md border px-3 py-2"
              disabled={disabled}
            />
          </label>
          <label className="block">
            <div className="text-sm font-medium">Maximum Stay (nights)</div>
            <input
              type="number"
              min="1"
              value={settings.max_stay_nights ?? ""}
              onChange={(e) => update("max_stay_nights", e.target.value ? Number(e.target.value) : undefined)}
              className="mt-1 w-full rounded-md border px-3 py-2"
              disabled={disabled}
            />
          </label>
        </div>

        <label className="block">
          <div className="text-sm font-medium">Age Restrictions</div>
          <input
            value={settings.age_restrictions ?? ""}
            onChange={(e) => update("age_restrictions", e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2"
            disabled={disabled}
          />
        </label>

        <label className="block">
          <div className="text-sm font-medium">Group Booking Policy</div>
          <textarea
            value={settings.group_booking_policy ?? ""}
            onChange={(e) => update("group_booking_policy", e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2"
            rows={2}
            disabled={disabled}
          />
        </label>

        <div className="rounded-lg border bg-zinc-50 p-4 space-y-4">
          <h3 className="font-semibold text-sm">Cancellation Policies</h3>
          <label className="block">
            <div className="text-sm font-medium">Full Refund Policy</div>
            <textarea
              value={settings.cancellation_full_refund_policy ?? ""}
              onChange={(e) => update("cancellation_full_refund_policy", e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              rows={2}
              disabled={disabled}
            />
          </label>
          <label className="block">
            <div className="text-sm font-medium">Full Refund Hours</div>
            <input
              type="number"
              min="0"
              value={settings.cancellation_full_refund_hours ?? ""}
              onChange={(e) => update("cancellation_full_refund_hours", e.target.value ? Number(e.target.value) : undefined)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              disabled={disabled}
            />
          </label>
          <label className="block">
            <div className="text-sm font-medium">Partial Refund Policy</div>
            <textarea
              value={settings.cancellation_partial_refund_policy ?? ""}
              onChange={(e) => update("cancellation_partial_refund_policy", e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              rows={2}
              disabled={disabled}
            />
          </label>
          <label className="block">
            <div className="text-sm font-medium">Partial Refund Hours</div>
            <input
              type="number"
              min="0"
              value={settings.cancellation_partial_refund_hours ?? ""}
              onChange={(e) => update("cancellation_partial_refund_hours", e.target.value ? Number(e.target.value) : undefined)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              disabled={disabled}
            />
          </label>
          <label className="block">
            <div className="text-sm font-medium">No Refund Policy</div>
            <textarea
              value={settings.cancellation_no_refund_policy ?? ""}
              onChange={(e) => update("cancellation_no_refund_policy", e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              rows={2}
              disabled={disabled}
            />
          </label>
        </div>

        <label className="block">
          <div className="text-sm font-medium">Payment Terms</div>
          <textarea
            value={settings.payment_terms ?? ""}
            onChange={(e) => update("payment_terms", e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2"
            rows={2}
            disabled={disabled}
          />
        </label>
      </div>
    </div>
  );
}
