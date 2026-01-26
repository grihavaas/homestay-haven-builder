"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Room {
  id: string;
  name: string;
}

interface Offer {
  id: string;
  room_id: string | null;
  offer_type: string;
  title: string;
  description: string | null;
  discount_percentage: number | null;
  discount_amount: number | null;
  valid_from: string | null;
  valid_to: string | null;
  is_active: boolean;
}

interface PromotionsManagerProps {
  propertyId: string;
  tenantId: string;
  rooms: Room[];
  offers: Offer[];
  createOffer: (formData: FormData) => Promise<void>;
  updateOffer: (formData: FormData) => Promise<void>;
  deleteOffer: (formData: FormData) => Promise<void>;
}

export function PromotionsManager({
  propertyId,
  tenantId,
  rooms,
  offers,
  createOffer,
  updateOffer,
  deleteOffer,
}: PromotionsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);

  async function handleCreateSubmit(formData: FormData) {
    await createOffer(formData);
    startTransition(() => {
      router.refresh();
      setShowForm(false);
    });
  }

  async function handleUpdateSubmit(formData: FormData) {
    await updateOffer(formData);
    startTransition(() => {
      router.refresh();
      setEditingOfferId(null);
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Promotions & Special Offers</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Create promotional offers and discounts for your property.
          </p>
        </div>
        {!showForm && editingOfferId === null && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800"
          >
            Add Offer
          </button>
        )}
      </div>

      {showForm && (
        <form action={handleCreateSubmit} className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Add Offer</h3>
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
              <div className="text-sm font-medium">Offer Type</div>
              <select
                name="offer_type"
                className="mt-1 w-full rounded-md border px-3 py-2"
                required
              >
                <option value="">Select type</option>
                <option value="early_bird">Early Bird</option>
                <option value="last_minute">Last Minute</option>
                <option value="package">Package</option>
                <option value="long_stay">Long Stay</option>
                <option value="family">Family</option>
                <option value="weekend">Weekend</option>
                <option value="weekday">Weekday</option>
              </select>
            </label>
            <label className="block">
              <div className="text-sm font-medium">Room (optional)</div>
              <select
                name="room_id"
                className="mt-1 w-full rounded-md border px-3 py-2"
              >
                <option value="">All rooms</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <div className="text-sm font-medium">Title</div>
            <input
              name="title"
              className="mt-1 w-full rounded-md border px-3 py-2"
              required
            />
          </label>

          <label className="block">
            <div className="text-sm font-medium">Description</div>
            <textarea
              name="description"
              className="mt-1 w-full rounded-md border px-3 py-2"
              rows={2}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <div className="text-sm font-medium">Discount Percentage</div>
              <input
                name="discount_percentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
            </label>
            <label className="block">
              <div className="text-sm font-medium">Discount Amount</div>
              <input
                name="discount_amount"
                type="number"
                step="0.01"
                min="0"
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
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

          <label className="flex items-center gap-2">
            <input name="is_active" type="checkbox" defaultChecked />
            <span className="text-sm">Active</span>
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800 disabled:bg-zinc-400"
            >
              {isPending ? "Adding..." : "Add Offer"}
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
          Offers
        </div>
        <div className="divide-y">
          {offers.map((offer) => (
            <div key={offer.id} className="p-3 text-sm">
              {editingOfferId === offer.id ? (
                <form action={handleUpdateSubmit} className="space-y-4">
                  <input type="hidden" name="offerId" value={offer.id} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <div className="text-sm font-medium">Offer Type</div>
                      <select
                        name="offer_type"
                        defaultValue={offer.offer_type}
                        className="mt-1 w-full rounded-md border px-3 py-2"
                        required
                      >
                        <option value="early_bird">Early Bird</option>
                        <option value="last_minute">Last Minute</option>
                        <option value="package">Package</option>
                        <option value="long_stay">Long Stay</option>
                        <option value="family">Family</option>
                        <option value="weekend">Weekend</option>
                        <option value="weekday">Weekday</option>
                      </select>
                    </label>
                    <label className="block">
                      <div className="text-sm font-medium">Room (optional)</div>
                      <select
                        name="room_id"
                        defaultValue={offer.room_id || ""}
                        className="mt-1 w-full rounded-md border px-3 py-2"
                      >
                        <option value="">All rooms</option>
                        {rooms.map((room) => (
                          <option key={room.id} value={room.id}>
                            {room.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="block">
                    <div className="text-sm font-medium">Title</div>
                    <input
                      name="title"
                      defaultValue={offer.title}
                      className="mt-1 w-full rounded-md border px-3 py-2"
                      required
                    />
                  </label>

                  <label className="block">
                    <div className="text-sm font-medium">Description</div>
                    <textarea
                      name="description"
                      defaultValue={offer.description || ""}
                      className="mt-1 w-full rounded-md border px-3 py-2"
                      rows={2}
                    />
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <div className="text-sm font-medium">Discount Percentage</div>
                      <input
                        name="discount_percentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        defaultValue={offer.discount_percentage || ""}
                        className="mt-1 w-full rounded-md border px-3 py-2"
                      />
                    </label>
                    <label className="block">
                      <div className="text-sm font-medium">Discount Amount</div>
                      <input
                        name="discount_amount"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={offer.discount_amount || ""}
                        className="mt-1 w-full rounded-md border px-3 py-2"
                      />
                    </label>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <div className="text-sm font-medium">Valid From</div>
                      <input
                        name="valid_from"
                        type="date"
                        defaultValue={offer.valid_from || ""}
                        className="mt-1 w-full rounded-md border px-3 py-2"
                      />
                    </label>
                    <label className="block">
                      <div className="text-sm font-medium">Valid To</div>
                      <input
                        name="valid_to"
                        type="date"
                        defaultValue={offer.valid_to || ""}
                        className="mt-1 w-full rounded-md border px-3 py-2"
                      />
                    </label>
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      name="is_active"
                      type="checkbox"
                      defaultChecked={offer.is_active}
                    />
                    <span className="text-sm">Active</span>
                  </label>

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
                      onClick={() => setEditingOfferId(null)}
                      className="rounded-md border px-4 py-2 text-zinc-700 hover:bg-zinc-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{offer.title}</div>
                    <div className="text-xs text-zinc-500">{offer.offer_type}</div>
                    {offer.valid_from && offer.valid_to && (
                      <div className="text-xs text-zinc-500">
                        {offer.valid_from} to {offer.valid_to}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingOfferId(offer.id)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <form action={deleteOffer}>
                      <input type="hidden" name="offerId" value={offer.id} />
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
          {offers.length === 0 ? (
            <div className="p-3 text-sm text-zinc-600">No offers yet.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
