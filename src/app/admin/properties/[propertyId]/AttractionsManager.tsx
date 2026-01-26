"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Attraction {
  id: string;
  name: string;
  type: string | null;
  distance: number | null;
  distance_unit: string | null;
  description: string | null;
  transportation_info: string | null;
  display_order: number | null;
}

interface Proximity {
  id: string;
  point_of_interest: string;
  distance: number | null;
  distance_unit: string | null;
  description: string | null;
}

interface AttractionsManagerProps {
  propertyId: string;
  tenantId: string;
  attractions: Attraction[];
  proximity: Proximity[];
  createAttraction: (formData: FormData) => Promise<void>;
  createProximity: (formData: FormData) => Promise<void>;
  updateAttraction: (formData: FormData) => Promise<void>;
  updateProximity: (formData: FormData) => Promise<void>;
  deleteAttraction: (formData: FormData) => Promise<void>;
  deleteProximity: (formData: FormData) => Promise<void>;
}

export function AttractionsManager({
  propertyId,
  tenantId,
  attractions,
  proximity,
  createAttraction,
  createProximity,
  updateAttraction,
  updateProximity,
  deleteAttraction,
  deleteProximity,
}: AttractionsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAttractionForm, setShowAttractionForm] = useState(false);
  const [showProximityForm, setShowProximityForm] = useState(false);
  const [editingAttractionId, setEditingAttractionId] = useState<string | null>(null);
  const [editingProximityId, setEditingProximityId] = useState<string | null>(null);

  async function handleAttractionSubmit(formData: FormData) {
    await createAttraction(formData);
    startTransition(() => {
      router.refresh();
      setShowAttractionForm(false);
    });
  }

  async function handleProximitySubmit(formData: FormData) {
    await createProximity(formData);
    startTransition(() => {
      router.refresh();
      setShowProximityForm(false);
    });
  }

  async function handleAttractionUpdate(formData: FormData) {
    await updateAttraction(formData);
    startTransition(() => {
      router.refresh();
      setEditingAttractionId(null);
    });
  }

  async function handleProximityUpdate(formData: FormData) {
    await updateProximity(formData);
    startTransition(() => {
      router.refresh();
      setEditingProximityId(null);
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Nearby Attractions</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Add tourist attractions, restaurants, and points of interest.
            </p>
          </div>
          {!showAttractionForm && editingAttractionId === null && (
            <button
              type="button"
              onClick={() => setShowAttractionForm(true)}
              className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800"
            >
              Add Attraction
            </button>
          )}
        </div>

        {showAttractionForm && (
          <form
            action={handleAttractionSubmit}
            className="mt-6 space-y-4 rounded-lg border p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Add Attraction</h3>
              <button
                type="button"
                onClick={() => setShowAttractionForm(false)}
                className="text-sm text-zinc-600 hover:text-zinc-900"
              >
                Cancel
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <div className="text-sm font-medium">Name</div>
                <input
                  name="name"
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required
                />
              </label>
              <label className="block">
                <div className="text-sm font-medium">Type</div>
                <select
                  name="type"
                  className="mt-1 w-full rounded-md border px-3 py-2"
                >
                  <option value="">Select type</option>
                  <option value="Tourist attraction">Tourist Attraction</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Park">Park</option>
                </select>
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block">
                <div className="text-sm font-medium">Distance</div>
                <input
                  name="distance"
                  type="number"
                  step="0.1"
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </label>
              <label className="block">
                <div className="text-sm font-medium">Unit</div>
                <select
                  name="distance_unit"
                  className="mt-1 w-full rounded-md border px-3 py-2"
                >
                  <option value="km">km</option>
                  <option value="miles">miles</option>
                </select>
              </label>
              <label className="block">
                <div className="text-sm font-medium">Display Order</div>
                <input
                  name="display_order"
                  type="number"
                  min="0"
                  defaultValue="0"
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </label>
            </div>

            <label className="block">
              <div className="text-sm font-medium">Description</div>
              <textarea
                name="description"
                className="mt-1 w-full rounded-md border px-3 py-2"
                rows={2}
              />
            </label>

            <label className="block">
              <div className="text-sm font-medium">Transportation Info</div>
              <input
                name="transportation_info"
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
            </label>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800 disabled:bg-zinc-400"
              >
                {isPending ? "Adding..." : "Add Attraction"}
              </button>
              <button
                type="button"
                onClick={() => setShowAttractionForm(false)}
                className="rounded-md border px-4 py-2 text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 rounded-lg border">
          <div className="border-b bg-zinc-50 p-3 text-sm font-medium">
            Attractions
          </div>
          <div className="divide-y">
            {attractions.map((attraction) => (
              <div key={attraction.id} className="p-3">
                {editingAttractionId === attraction.id ? (
                  <form action={handleAttractionUpdate} className="space-y-4">
                    <input type="hidden" name="attractionId" value={attraction.id} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <div className="text-sm font-medium">Name</div>
                        <input
                          name="name"
                          defaultValue={attraction.name}
                          className="mt-1 w-full rounded-md border px-3 py-2"
                          required
                        />
                      </label>
                      <label className="block">
                        <div className="text-sm font-medium">Type</div>
                        <select
                          name="type"
                          defaultValue={attraction.type || ""}
                          className="mt-1 w-full rounded-md border px-3 py-2"
                        >
                          <option value="">Select type</option>
                          <option value="Tourist attraction">Tourist Attraction</option>
                          <option value="Restaurant">Restaurant</option>
                          <option value="Shopping">Shopping</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="Park">Park</option>
                        </select>
                      </label>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <label className="block">
                        <div className="text-sm font-medium">Distance</div>
                        <input
                          name="distance"
                          type="number"
                          step="0.1"
                          defaultValue={attraction.distance || ""}
                          className="mt-1 w-full rounded-md border px-3 py-2"
                        />
                      </label>
                      <label className="block">
                        <div className="text-sm font-medium">Unit</div>
                        <select
                          name="distance_unit"
                          defaultValue={attraction.distance_unit || "km"}
                          className="mt-1 w-full rounded-md border px-3 py-2"
                        >
                          <option value="km">km</option>
                          <option value="miles">miles</option>
                        </select>
                      </label>
                      <label className="block">
                        <div className="text-sm font-medium">Display Order</div>
                        <input
                          name="display_order"
                          type="number"
                          min="0"
                          defaultValue={attraction.display_order || 0}
                          className="mt-1 w-full rounded-md border px-3 py-2"
                        />
                      </label>
                    </div>
                    <label className="block">
                      <div className="text-sm font-medium">Description</div>
                      <textarea
                        name="description"
                        defaultValue={attraction.description || ""}
                        className="mt-1 w-full rounded-md border px-3 py-2"
                        rows={2}
                      />
                    </label>
                    <label className="block">
                      <div className="text-sm font-medium">Transportation Info</div>
                      <input
                        name="transportation_info"
                        defaultValue={attraction.transportation_info || ""}
                        className="mt-1 w-full rounded-md border px-3 py-2"
                      />
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
                        onClick={() => setEditingAttractionId(null)}
                        className="rounded-md border px-4 py-2 text-zinc-700 hover:bg-zinc-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{attraction.name}</div>
                      {attraction.type && (
                        <div className="text-sm text-zinc-600">{attraction.type}</div>
                      )}
                      {attraction.distance && (
                        <div className="text-xs text-zinc-500">
                          {attraction.distance} {attraction.distance_unit}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingAttractionId(attraction.id)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <form action={deleteAttraction}>
                        <input type="hidden" name="attractionId" value={attraction.id} />
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
            {attractions.length === 0 ? (
              <div className="p-3 text-sm text-zinc-600">No attractions yet.</div>
            ) : null}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Proximity Information</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Add distance to key points (airport, city center, etc.).
            </p>
          </div>
          {!showProximityForm && editingProximityId === null && (
            <button
              type="button"
              onClick={() => setShowProximityForm(true)}
              className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800"
            >
              Add Proximity Point
            </button>
          )}
        </div>

        {showProximityForm && (
          <form action={handleProximitySubmit} className="mt-6 space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Add Proximity Point</h3>
              <button
                type="button"
                onClick={() => setShowProximityForm(false)}
                className="text-sm text-zinc-600 hover:text-zinc-900"
              >
                Cancel
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block">
                <div className="text-sm font-medium">Point of Interest</div>
                <input
                  name="point_of_interest"
                  placeholder="Airport, City Center..."
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required
                />
              </label>
              <label className="block">
                <div className="text-sm font-medium">Distance</div>
                <input
                  name="distance"
                  type="number"
                  step="0.1"
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </label>
              <label className="block">
                <div className="text-sm font-medium">Unit</div>
                <select
                  name="distance_unit"
                  className="mt-1 w-full rounded-md border px-3 py-2"
                >
                  <option value="km">km</option>
                  <option value="miles">miles</option>
                </select>
              </label>
            </div>

            <label className="block">
              <div className="text-sm font-medium">Description</div>
              <textarea
                name="description"
                className="mt-1 w-full rounded-md border px-3 py-2"
                rows={2}
              />
            </label>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800 disabled:bg-zinc-400"
              >
                {isPending ? "Adding..." : "Add Proximity Point"}
              </button>
              <button
                type="button"
                onClick={() => setShowProximityForm(false)}
                className="rounded-md border px-4 py-2 text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 rounded-lg border">
          <div className="border-b bg-zinc-50 p-3 text-sm font-medium">
            Proximity Points
          </div>
          <div className="divide-y">
            {proximity.map((item) => (
              <div key={item.id} className="p-3">
                {editingProximityId === item.id ? (
                  <form action={handleProximityUpdate} className="space-y-4">
                    <input type="hidden" name="proximityId" value={item.id} />
                    <div className="grid gap-3 sm:grid-cols-3">
                      <label className="block">
                        <div className="text-sm font-medium">Point of Interest</div>
                        <input
                          name="point_of_interest"
                          defaultValue={item.point_of_interest}
                          placeholder="Airport, City Center..."
                          className="mt-1 w-full rounded-md border px-3 py-2"
                          required
                        />
                      </label>
                      <label className="block">
                        <div className="text-sm font-medium">Distance</div>
                        <input
                          name="distance"
                          type="number"
                          step="0.1"
                          defaultValue={item.distance || ""}
                          className="mt-1 w-full rounded-md border px-3 py-2"
                        />
                      </label>
                      <label className="block">
                        <div className="text-sm font-medium">Unit</div>
                        <select
                          name="distance_unit"
                          defaultValue={item.distance_unit || "km"}
                          className="mt-1 w-full rounded-md border px-3 py-2"
                        >
                          <option value="km">km</option>
                          <option value="miles">miles</option>
                        </select>
                      </label>
                    </div>
                    <label className="block">
                      <div className="text-sm font-medium">Description</div>
                      <textarea
                        name="description"
                        defaultValue={item.description || ""}
                        className="mt-1 w-full rounded-md border px-3 py-2"
                        rows={2}
                      />
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
                        onClick={() => setEditingProximityId(null)}
                        className="rounded-md border px-4 py-2 text-zinc-700 hover:bg-zinc-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{item.point_of_interest}</div>
                      {item.distance && (
                        <div className="text-sm text-zinc-600">
                          {item.distance} {item.distance_unit}
                        </div>
                      )}
                      {item.description && (
                        <div className="text-xs text-zinc-500">{item.description}</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingProximityId(item.id)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <form action={deleteProximity}>
                        <input type="hidden" name="proximityId" value={item.id} />
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
            {proximity.length === 0 ? (
              <div className="p-3 text-sm text-zinc-600">No proximity points yet.</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
