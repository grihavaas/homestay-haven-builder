import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DepositSection } from "./DepositSection";

async function getBookingSettings(propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("booking_settings")
    .select("*")
    .eq("property_id", propertyId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function BookingTab({
  propertyId,
  tenantId,
}: {
  propertyId: string;
  tenantId: string;
}) {
  const settings = await getBookingSettings(propertyId);

  async function saveSettings(formData: FormData) {
    "use server";
    const supabase = await createSupabaseServerClient();

    const payload = {
      property_id: propertyId,
      tenant_id: tenantId,
      check_in_time: String(formData.get("check_in_time") ?? "").trim() || null,
      check_out_time: String(formData.get("check_out_time") ?? "").trim() || null,
      min_stay_nights: Number(formData.get("min_stay_nights")) || 1,
      max_stay_nights: Number(formData.get("max_stay_nights")) || null,
      age_restrictions: String(formData.get("age_restrictions") ?? "").trim() || null,
      group_booking_policy: String(formData.get("group_booking_policy") ?? "").trim() || null,
      cancellation_full_refund_policy: String(formData.get("cancellation_full_refund_policy") ?? "").trim() || null,
      cancellation_full_refund_hours: Number(formData.get("cancellation_full_refund_hours")) || null,
      cancellation_partial_refund_policy: String(formData.get("cancellation_partial_refund_policy") ?? "").trim() || null,
      cancellation_partial_refund_hours: Number(formData.get("cancellation_partial_refund_hours")) || null,
      cancellation_no_refund_policy: String(formData.get("cancellation_no_refund_policy") ?? "").trim() || null,
      deposit_required: formData.get("deposit_required") === "on",
      deposit_type: String(formData.get("deposit_type") ?? "").trim() || null,
      deposit_value: Number(formData.get("deposit_value")) || null,
      payment_terms: String(formData.get("payment_terms") ?? "").trim() || null,
    };

    if (settings) {
      const { error } = await supabase
        .from("booking_settings")
        .update(payload)
        .eq("property_id", propertyId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("booking_settings").insert(payload);
      if (error) throw error;
    }

    revalidatePath(`/admin/properties/${propertyId}`);
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">Booking Settings</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Configure booking policies and requirements.
      </p>

      <form action={saveSettings} className="mt-6 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <div className="text-sm font-medium">Check-in Time</div>
            <input
              name="check_in_time"
              type="time"
              defaultValue={settings?.check_in_time || ""}
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </label>
          <label className="block">
            <div className="text-sm font-medium">Check-out Time</div>
            <input
              name="check_out_time"
              type="time"
              defaultValue={settings?.check_out_time || ""}
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <div className="text-sm font-medium">Minimum Stay (nights)</div>
            <input
              name="min_stay_nights"
              type="number"
              min="1"
              defaultValue={settings?.min_stay_nights || 1}
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </label>
          <label className="block">
            <div className="text-sm font-medium">Maximum Stay (nights)</div>
            <input
              name="max_stay_nights"
              type="number"
              min="1"
              defaultValue={settings?.max_stay_nights || ""}
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </label>
        </div>

        <label className="block">
          <div className="text-sm font-medium">Age Restrictions</div>
          <input
            name="age_restrictions"
            placeholder="e.g., Children under 12 stay free"
            defaultValue={settings?.age_restrictions || ""}
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>

        <label className="block">
          <div className="text-sm font-medium">Group Booking Policy</div>
          <textarea
            name="group_booking_policy"
            defaultValue={settings?.group_booking_policy || ""}
            placeholder="e.g., Groups of 5+ rooms eligible for special rates"
            className="mt-1 w-full rounded-md border px-3 py-2"
            rows={2}
          />
        </label>

        {/* 3-Tier Cancellation Policies */}
        <div className="rounded-lg border bg-zinc-50 p-4 space-y-4">
          <h3 className="font-semibold text-sm">Cancellation Policies</h3>
          <p className="text-xs text-zinc-600">Define three tiers of cancellation policies with deadlines</p>

          {/* Full Refund Policy */}
          <div className="rounded-md border bg-white p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700">
                100%
              </div>
              <span className="text-sm font-medium">Full Refund Policy</span>
            </div>
            <label className="block">
              <div className="text-xs font-medium text-zinc-700">Policy Description</div>
              <textarea
                name="cancellation_full_refund_policy"
                defaultValue={settings?.cancellation_full_refund_policy || ""}
                placeholder="e.g., Free cancellation for a full refund"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                rows={2}
              />
            </label>
            <label className="block">
              <div className="text-xs font-medium text-zinc-700">Cancellation Deadline (hours before check-in)</div>
              <input
                name="cancellation_full_refund_hours"
                type="number"
                min="0"
                defaultValue={settings?.cancellation_full_refund_hours || ""}
                placeholder="e.g., 168 (7 days)"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>
          </div>

          {/* Partial Refund Policy */}
          <div className="rounded-md border bg-white p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100 text-xs font-semibold text-yellow-700">
                50%
              </div>
              <span className="text-sm font-medium">Partial Refund Policy</span>
            </div>
            <label className="block">
              <div className="text-xs font-medium text-zinc-700">Policy Description</div>
              <textarea
                name="cancellation_partial_refund_policy"
                defaultValue={settings?.cancellation_partial_refund_policy || ""}
                placeholder="e.g., Partial refund available"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                rows={2}
              />
            </label>
            <label className="block">
              <div className="text-xs font-medium text-zinc-700">Cancellation Deadline (hours before check-in)</div>
              <input
                name="cancellation_partial_refund_hours"
                type="number"
                min="0"
                defaultValue={settings?.cancellation_partial_refund_hours || ""}
                placeholder="e.g., 72 (3 days)"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>
          </div>

          {/* No Refund Policy */}
          <div className="rounded-md border bg-white p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-semibold text-red-700">
                0%
              </div>
              <span className="text-sm font-medium">No Refund Policy</span>
            </div>
            <label className="block">
              <div className="text-xs font-medium text-zinc-700">Policy Description</div>
              <textarea
                name="cancellation_no_refund_policy"
                defaultValue={settings?.cancellation_no_refund_policy || ""}
                placeholder="e.g., No refund for cancellations within 72 hours"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                rows={2}
              />
            </label>
            <p className="text-xs text-zinc-500">No deadline needed - applies when other policies don't apply</p>
          </div>
        </div>

        <div className="rounded-md border p-4">
          <label className="flex items-center gap-2">
            <input
              name="deposit_required"
              type="checkbox"
              defaultChecked={settings?.deposit_required || false}
              id="deposit_required"
            />
            <span className="text-sm font-medium">Deposit Required</span>
          </label>
          <DepositSection
            depositType={settings?.deposit_type}
            depositValue={settings?.deposit_value || settings?.deposit_percentage}
          />
        </div>

        <label className="block">
          <div className="text-sm font-medium">Payment Terms</div>
          <textarea
            name="payment_terms"
            defaultValue={settings?.payment_terms || ""}
            className="mt-1 w-full rounded-md border px-3 py-2"
            rows={2}
          />
        </label>

        <button className="rounded-md bg-black px-4 py-2 text-white">
          Save Settings
        </button>
      </form>
    </div>
  );
}
