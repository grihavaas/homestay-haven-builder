"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Room {
  id: string;
  name: string;
}

interface Pricing {
  id: string;
  room_id: string;
  base_rate: number;
  discounted_rate: number | null;
  original_price: number | null;
  currency: string;
  valid_from: string | null;
  valid_to: string | null;
  pricing_type: string;
}

interface PricingManagerProps {
  propertyId: string;
  tenantId: string;
  rooms: Room[];
  pricing: Pricing[];
  createPricing: (formData: FormData) => Promise<void>;
  updatePricing: (formData: FormData) => Promise<void>;
  deletePricing: (formData: FormData) => Promise<void>;
}

export function PricingManager({
  propertyId,
  tenantId,
  rooms,
  pricing,
  createPricing,
  updatePricing,
  deletePricing,
}: PricingManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editingPricingId, setEditingPricingId] = useState<string | null>(null);

  async function handleCreateSubmit(formData: FormData) {
    await createPricing(formData);
    startTransition(() => {
      router.refresh();
      setShowForm(false);
    });
  }

  async function handleUpdateSubmit(formData: FormData) {
    await updatePricing(formData);
    startTransition(() => {
      router.refresh();
      setEditingPricingId(null);
    });
  }

  const getRoomName = (roomId: string) => {
    return rooms.find(r => r.id === roomId)?.name || "Unknown Room";
  };

  // Group pricing by room_id
  const groupedPricing = pricing.reduce((acc, p) => {
    if (!acc[p.room_id]) {
      acc[p.room_id] = [];
    }
    acc[p.room_id].push(p);
    return acc;
  }, {} as Record<string, Pricing[]>);

  // Sort pricing within each group by valid_from date
  Object.keys(groupedPricing).forEach(roomId => {
    groupedPricing[roomId].sort((a, b) => {
      const dateA = a.valid_from || "";
      const dateB = b.valid_from || "";
      return dateA.localeCompare(dateB);
    });
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Room Pricing</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Set pricing for rooms with date ranges. All pricing is per night.
          </p>
        </div>
        {!showForm && editingPricingId === null && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800"
          >
            Add Pricing
          </button>
        )}
      </div>

      {showForm && (
        <form action={handleCreateSubmit} className="mt-6 space-y-4 rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Add Pricing</h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-zinc-600 hover:text-zinc-900"
            >
              Cancel
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <div className="text-sm font-medium">Room</div>
              <select
                name="room_id"
                className="mt-1 w-full rounded-md border px-3 py-2"
                required
              >
                <option value="">Select room</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <div className="text-sm font-medium">Base Rate</div>
              <input
                name="base_rate"
                type="number"
                step="0.01"
                min="0"
                className="mt-1 w-full rounded-md border px-3 py-2"
                required
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <div className="text-sm font-medium">Discounted Rate</div>
              <input
                name="discounted_rate"
                type="number"
                step="0.01"
                min="0"
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
            </label>
            <label className="block">
              <div className="text-sm font-medium">Original Price</div>
              <input
                name="original_price"
                type="number"
                step="0.01"
                min="0"
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <div className="text-sm font-medium">Currency</div>
              <select
                name="currency"
                className="mt-1 w-full rounded-md border px-3 py-2"
                defaultValue="USD"
              >
                <option value="USD">USD</option>
                <option value="INR">INR</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </label>
            <label className="block">
              <div className="text-sm font-medium">Valid From</div>
              <input
                name="valid_from"
                type="date"
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
            </label>
            <label className="block">
              <div className="text-sm font-medium">Valid To</div>
              <input
                name="valid_to"
                type="date"
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800 disabled:bg-zinc-400"
            >
              {isPending ? "Adding..." : "Add Pricing"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-md border px-4 py-2 text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 rounded-lg border">
        <div className="border-b bg-zinc-50 p-3 text-sm font-medium">
          Pricing Records
        </div>
        {Object.keys(groupedPricing).length === 0 ? (
          <div className="p-3 text-sm text-zinc-600">No pricing records yet.</div>
        ) : (
          <div className="divide-y">
            {Object.entries(groupedPricing).map(([roomId, roomPricing]) => (
              <div key={roomId} className="divide-y">
                <div className="bg-zinc-50 px-4 py-2 font-medium text-sm border-b">
                  {getRoomName(roomId)}
                </div>
                {roomPricing.map((p) => (
                  <div key={p.id} className="p-3 text-sm pl-6">
                    {editingPricingId === p.id ? (
                      <form action={handleUpdateSubmit} className="space-y-4">
                        <input type="hidden" name="pricingId" value={p.id} />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="block">
                            <div className="text-sm font-medium">Room</div>
                            <select
                              name="room_id"
                              defaultValue={p.room_id}
                              className="mt-1 w-full rounded-md border px-3 py-2"
                              required
                            >
                              {rooms.map((room) => (
                                <option key={room.id} value={room.id}>
                                  {room.name}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="block">
                            <div className="text-sm font-medium">Base Rate</div>
                            <input
                              name="base_rate"
                              type="number"
                              step="0.01"
                              min="0"
                              defaultValue={p.base_rate}
                              className="mt-1 w-full rounded-md border px-3 py-2"
                              required
                            />
                          </label>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="block">
                            <div className="text-sm font-medium">Discounted Rate</div>
                            <input
                              name="discounted_rate"
                              type="number"
                              step="0.01"
                              min="0"
                              defaultValue={p.discounted_rate || ""}
                              className="mt-1 w-full rounded-md border px-3 py-2"
                            />
                          </label>
                          <label className="block">
                            <div className="text-sm font-medium">Original Price</div>
                            <input
                              name="original_price"
                              type="number"
                              step="0.01"
                              min="0"
                              defaultValue={p.original_price || ""}
                              className="mt-1 w-full rounded-md border px-3 py-2"
                            />
                          </label>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <label className="block">
                            <div className="text-sm font-medium">Currency</div>
                            <select
                              name="currency"
                              defaultValue={p.currency || "USD"}
                              className="mt-1 w-full rounded-md border px-3 py-2"
                            >
                              <option value="USD">USD</option>
                              <option value="INR">INR</option>
                              <option value="EUR">EUR</option>
                              <option value="GBP">GBP</option>
                            </select>
                          </label>
                          <label className="block">
                            <div className="text-sm font-medium">Valid From</div>
                            <input
                              name="valid_from"
                              type="date"
                              defaultValue={p.valid_from || ""}
                              className="mt-1 w-full rounded-md border px-3 py-2"
                            />
                          </label>
                          <label className="block">
                            <div className="text-sm font-medium">Valid To</div>
                            <input
                              name="valid_to"
                              type="date"
                              defaultValue={p.valid_to || ""}
                              className="mt-1 w-full rounded-md border px-3 py-2"
                            />
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={isPending}
                            className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800 disabled:bg-zinc-400"
                          >
                            {isPending ? "Saving..." : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingPricingId(null)}
                            className="rounded-md border px-4 py-2 text-zinc-700 hover:bg-zinc-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">
                            {p.currency} {p.base_rate?.toFixed(2) || "0.00"} per night
                          </div>
                          {p.valid_from && p.valid_to && (
                            <div className="text-xs text-zinc-500">
                              {p.valid_from} to {p.valid_to}
                            </div>
                          )}
                          {p.discounted_rate && (
                            <div className="text-xs text-green-600">
                              Discounted: {p.currency} {p.discounted_rate.toFixed(2)}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingPricingId(p.id)}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                          <form action={deletePricing}>
                            <input type="hidden" name="pricingId" value={p.id} />
                            <button
                              type="submit"
                              className="text-xs text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
