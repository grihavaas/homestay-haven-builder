"use client";

import { useRouter } from "next/navigation";

export function RoomsForm({ 
  createRoom,
  isOpen,
  onOpenChange,
}: { 
  createRoom: (formData: FormData) => Promise<void>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  if (!isOpen) {
    return (
      <button
        onClick={() => onOpenChange(true)}
        className="rounded-md bg-black px-4 py-2 text-white"
      >
        Add Room
      </button>
    );
  }

  return (
    <form action={createRoom} className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Create New Room</h3>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="text-sm text-zinc-600 hover:underline"
        >
          Cancel
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <div className="text-sm font-medium">Room Name</div>
          <input
            name="name"
            placeholder="Deluxe Room, Suite, Villa..."
            className="mt-1 w-full rounded-md border px-3 py-2"
            required
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium">View Type</div>
          <select
            name="view_type"
            defaultValue=""
            className="mt-1 w-full rounded-md border px-3 py-2"
          >
            <option value="">Select view type</option>
            <option value="Sea view">Sea view</option>
            <option value="Ocean view">Ocean view</option>
            <option value="Beach view">Beach view</option>
            <option value="Garden view">Garden view</option>
            <option value="Mountain view">Mountain view</option>
            <option value="City view">City view</option>
            <option value="Pool view">Pool view</option>
            <option value="Lake view">Lake view</option>
            <option value="River view">River view</option>
            <option value="Forest view">Forest view</option>
            <option value="Courtyard view">Courtyard view</option>
            <option value="No view">No view</option>
          </select>
        </label>
      </div>

      <label className="block">
        <div className="text-sm font-medium">Description</div>
        <textarea
          name="description"
          className="mt-1 w-full rounded-md border px-3 py-2"
          rows={3}
        />
      </label>

      <div className="rounded-md border p-4 space-y-3 bg-zinc-50">
        <h5 className="text-sm font-semibold">Guest Capacity</h5>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <div className="text-sm font-medium">Max Guests *</div>
            <input
              name="max_guests"
              type="number"
              min="1"
              className="mt-1 w-full rounded-md border px-3 py-2"
              required
            />
            <p className="mt-1 text-xs text-zinc-500">Total capacity (adults + children)</p>
          </label>
          <label className="block">
            <div className="text-sm font-medium">Adults Capacity</div>
            <input
              name="adults_capacity"
              type="number"
              min="1"
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
            <p className="mt-1 text-xs text-zinc-500">Optional: Max adults (e.g., 2 for 1 king bed)</p>
          </label>
          <label className="block">
            <div className="text-sm font-medium">Children Capacity</div>
            <input
              name="children_capacity"
              type="number"
              min="0"
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
            <p className="mt-1 text-xs text-zinc-500">Optional: Max children (via extra beds/cribs)</p>
          </label>
        </div>
        <p className="text-xs text-zinc-600">
          💡 <strong>Tip:</strong> Common pattern is "2 adults + 2 children". 
          If adults + children ≤ max guests, the breakdown will be shown on the website.
        </p>
      </div>
      <label className="block">
        <div className="text-sm font-medium">Room Size (sqft)</div>
        <input
          name="room_size_sqft"
          type="number"
          min="0"
          className="mt-1 w-full rounded-md border px-3 py-2"
        />
      </label>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-white"
          onClick={async (e) => {
            e.preventDefault();
            const form = e.currentTarget.closest("form");
            if (form) {
              const formData = new FormData(form);
              await createRoom(formData);
              onOpenChange(false);
              router.refresh();
            }
          }}
        >
          Create Room
        </button>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="rounded-md border px-4 py-2 text-zinc-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
