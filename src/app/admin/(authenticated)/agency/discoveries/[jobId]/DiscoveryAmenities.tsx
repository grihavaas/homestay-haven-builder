"use client";

import { useState } from "react";

export function DiscoveryAmenities({
  amenities,
  tags,
  onChangeAmenities,
  onChangeTags,
  disabled,
}: {
  amenities: string[];
  tags: string[];
  onChangeAmenities: (amenities: string[]) => void;
  onChangeTags: (tags: string[]) => void;
  disabled?: boolean;
}) {
  const [newAmenity, setNewAmenity] = useState("");
  const [newTag, setNewTag] = useState("");

  function addAmenity() {
    const value = newAmenity.trim();
    if (!value || amenities.includes(value)) return;
    onChangeAmenities([...amenities, value]);
    setNewAmenity("");
  }

  function removeAmenity(item: string) {
    onChangeAmenities(amenities.filter((a) => a !== item));
  }

  function addTag() {
    const value = newTag.trim();
    if (!value || tags.includes(value)) return;
    onChangeTags([...tags, value]);
    setNewTag("");
  }

  function removeTag(item: string) {
    onChangeTags(tags.filter((t) => t !== item));
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Property Amenities</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Amenities extracted from the listing. Add or remove as needed.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {amenities.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-sm"
            >
              {item}
              {!disabled && (
                <button
                  onClick={() => removeAmenity(item)}
                  className="ml-1 text-zinc-500 hover:text-zinc-700"
                >
                  x
                </button>
              )}
            </span>
          ))}
        </div>
        {!disabled && (
          <div className="mt-3 flex gap-2">
            <input
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
              placeholder="Add amenity..."
              className="rounded-md border px-3 py-2 text-sm"
            />
            <button
              onClick={addAmenity}
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800"
            >
              Add
            </button>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold">Property Tags</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Tags that describe this property.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-800"
            >
              {item}
              {!disabled && (
                <button
                  onClick={() => removeTag(item)}
                  className="ml-1 text-blue-500 hover:text-blue-700"
                >
                  x
                </button>
              )}
            </span>
          ))}
        </div>
        {!disabled && (
          <div className="mt-3 flex gap-2">
            <input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              placeholder="Add tag..."
              className="rounded-md border px-3 py-2 text-sm"
            />
            <button
              onClick={addTag}
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800"
            >
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
