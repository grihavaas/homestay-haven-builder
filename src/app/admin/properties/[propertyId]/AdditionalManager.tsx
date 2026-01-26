"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Feature {
  id: string;
  feature_type: string;
  description: string;
  display_order: number | null;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

interface PaymentMethod {
  id: string;
  payment_type: string;
  is_available: boolean;
}

interface CTA {
  id: string;
  cta_type: string;
  label: string;
  url: string | null;
  phone_number: string | null;
  is_active: boolean;
  display_order: number | null;
}

interface AdditionalManagerProps {
  propertyId: string;
  tenantId: string;
  features: Feature[];
  socialLinks: SocialLink[];
  paymentMethods: PaymentMethod[];
  ctas: CTA[];
  createFeature: (formData: FormData) => Promise<void>;
  createSocialLink: (formData: FormData) => Promise<void>;
  createPaymentMethod: (formData: FormData) => Promise<void>;
  createCTA: (formData: FormData) => Promise<void>;
  updateFeature: (formData: FormData) => Promise<void>;
  updateSocialLink: (formData: FormData) => Promise<void>;
  updatePaymentMethod: (formData: FormData) => Promise<void>;
  updateCTA: (formData: FormData) => Promise<void>;
  deleteFeature: (formData: FormData) => Promise<void>;
  deleteSocialLink: (formData: FormData) => Promise<void>;
  deletePaymentMethod: (formData: FormData) => Promise<void>;
  deleteCTA: (formData: FormData) => Promise<void>;
}

export function AdditionalManager({
  propertyId,
  tenantId,
  features,
  socialLinks,
  paymentMethods,
  ctas,
  createFeature,
  createSocialLink,
  createPaymentMethod,
  createCTA,
  updateFeature,
  updateSocialLink,
  updatePaymentMethod,
  updateCTA,
  deleteFeature,
  deleteSocialLink,
  deletePaymentMethod,
  deleteCTA,
}: AdditionalManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showFeatureForm, setShowFeatureForm] = useState(false);
  const [showSocialForm, setShowSocialForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showCTAForm, setShowCTAForm] = useState(false);
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);
  const [editingSocialId, setEditingSocialId] = useState<string | null>(null);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editingCTAId, setEditingCTAId] = useState<string | null>(null);

  async function handleFeatureSubmit(formData: FormData) {
    await createFeature(formData);
    startTransition(() => {
      router.refresh();
      setShowFeatureForm(false);
    });
  }

  async function handleSocialSubmit(formData: FormData) {
    await createSocialLink(formData);
    startTransition(() => {
      router.refresh();
      setShowSocialForm(false);
    });
  }

  async function handlePaymentSubmit(formData: FormData) {
    await createPaymentMethod(formData);
    startTransition(() => {
      router.refresh();
      setShowPaymentForm(false);
    });
  }

  async function handleCTASubmit(formData: FormData) {
    await createCTA(formData);
    startTransition(() => {
      router.refresh();
      setShowCTAForm(false);
    });
  }

  async function handleFeatureUpdate(formData: FormData) {
    await updateFeature(formData);
    startTransition(() => {
      router.refresh();
      setEditingFeatureId(null);
    });
  }

  async function handleSocialUpdate(formData: FormData) {
    await updateSocialLink(formData);
    startTransition(() => {
      router.refresh();
      setEditingSocialId(null);
    });
  }

  async function handlePaymentUpdate(formData: FormData) {
    await updatePaymentMethod(formData);
    startTransition(() => {
      router.refresh();
      setEditingPaymentId(null);
    });
  }

  async function handleCTAUpdate(formData: FormData) {
    await updateCTA(formData);
    startTransition(() => {
      router.refresh();
      setEditingCTAId(null);
    });
  }

  return (
    <div className="space-y-8">
      {/* Property Features */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Property Features</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Highlight unique features and selling points.
            </p>
          </div>
          {!showFeatureForm && editingFeatureId === null && (
            <button
              type="button"
              onClick={() => setShowFeatureForm(true)}
              className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800"
            >
              Add Feature
            </button>
          )}
        </div>

        {showFeatureForm && (
          <form action={handleFeatureSubmit} className="mt-6 space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Add Feature</h3>
              <button
                type="button"
                onClick={() => setShowFeatureForm(false)}
                className="text-sm text-zinc-600 hover:text-zinc-900"
              >
                Cancel
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <div className="text-sm font-medium">Feature Type</div>
                <select
                  name="feature_type"
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required
                >
                  <option value="">Select type</option>
                  <option value="architecture">Architecture</option>
                  <option value="historical">Historical</option>
                  <option value="scenic">Scenic</option>
                  <option value="experiences">Experiences</option>
                  <option value="dining">Dining</option>
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
                rows={3}
                required
              />
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800 disabled:bg-zinc-400"
              >
                {isPending ? "Adding..." : "Add Feature"}
              </button>
              <button
                type="button"
                onClick={() => setShowFeatureForm(false)}
                className="rounded-md border px-4 py-2 text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 rounded-lg border">
          <div className="border-b bg-zinc-50 p-3 text-sm font-medium">Features</div>
          <div className="divide-y">
            {features.map((feature) => (
              <div key={feature.id} className="p-3">
                {editingFeatureId === feature.id ? (
                  <form action={handleFeatureUpdate} className="space-y-4">
                    <input type="hidden" name="featureId" value={feature.id} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <div className="text-sm font-medium">Feature Type</div>
                        <select
                          name="feature_type"
                          defaultValue={feature.feature_type}
                          className="mt-1 w-full rounded-md border px-3 py-2"
                          required
                        >
                          <option value="architecture">Architecture</option>
                          <option value="historical">Historical</option>
                          <option value="scenic">Scenic</option>
                          <option value="experiences">Experiences</option>
                          <option value="dining">Dining</option>
                        </select>
                      </label>
                      <label className="block">
                        <div className="text-sm font-medium">Display Order</div>
                        <input
                          name="display_order"
                          type="number"
                          min="0"
                          defaultValue={feature.display_order || 0}
                          className="mt-1 w-full rounded-md border px-3 py-2"
                        />
                      </label>
                    </div>
                    <label className="block">
                      <div className="text-sm font-medium">Description</div>
                      <textarea
                        name="description"
                        defaultValue={feature.description}
                        className="mt-1 w-full rounded-md border px-3 py-2"
                        rows={3}
                        required
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
                        onClick={() => setEditingFeatureId(null)}
                        className="rounded-md border px-4 py-2 text-zinc-700 hover:bg-zinc-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{feature.feature_type}</div>
                      <div className="text-sm text-zinc-600">{feature.description}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingFeatureId(feature.id)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <form action={deleteFeature}>
                        <input type="hidden" name="featureId" value={feature.id} />
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
            {features.length === 0 ? (
              <div className="p-3 text-sm text-zinc-600">No features yet.</div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Social Media Links */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Social Media Links</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Add links to your social media profiles.
            </p>
          </div>
          {!showSocialForm && editingSocialId === null && (
            <button
              type="button"
              onClick={() => setShowSocialForm(true)}
              className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800"
            >
              Add Link
            </button>
          )}
        </div>

        {showSocialForm && (
          <form action={handleSocialSubmit} className="mt-6 space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Add Social Link</h3>
              <button
                type="button"
                onClick={() => setShowSocialForm(false)}
                className="text-sm text-zinc-600 hover:text-zinc-900"
              >
                Cancel
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <div className="text-sm font-medium">Platform</div>
                <input
                  name="platform"
                  placeholder="Facebook, Instagram, Twitter..."
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required
                />
              </label>
              <label className="block">
                <div className="text-sm font-medium">URL</div>
                <input
                  name="url"
                  type="url"
                  placeholder="https://..."
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required
                />
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800 disabled:bg-zinc-400"
              >
                {isPending ? "Adding..." : "Add Link"}
              </button>
              <button
                type="button"
                onClick={() => setShowSocialForm(false)}
                className="rounded-md border px-4 py-2 text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 rounded-lg border">
          <div className="border-b bg-zinc-50 p-3 text-sm font-medium">Social Links</div>
          <div className="divide-y">
            {socialLinks.map((link) => (
              <div key={link.id} className="p-3">
                {editingSocialId === link.id ? (
                  <form action={handleSocialUpdate} className="space-y-4">
                    <input type="hidden" name="linkId" value={link.id} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <div className="text-sm font-medium">Platform</div>
                        <input
                          name="platform"
                          defaultValue={link.platform}
                          className="mt-1 w-full rounded-md border px-3 py-2"
                          required
                        />
                      </label>
                      <label className="block">
                        <div className="text-sm font-medium">URL</div>
                        <input
                          name="url"
                          type="url"
                          defaultValue={link.url}
                          className="mt-1 w-full rounded-md border px-3 py-2"
                          required
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
                        onClick={() => setEditingSocialId(null)}
                        className="rounded-md border px-4 py-2 text-zinc-700 hover:bg-zinc-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{link.platform}</div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {link.url}
                      </a>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingSocialId(link.id)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <form action={deleteSocialLink}>
                        <input type="hidden" name="linkId" value={link.id} />
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
            {socialLinks.length === 0 ? (
              <div className="p-3 text-sm text-zinc-600">No social links yet.</div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Payment Methods</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Specify accepted payment methods.
            </p>
          </div>
          {!showPaymentForm && editingPaymentId === null && (
            <button
              type="button"
              onClick={() => setShowPaymentForm(true)}
              className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800"
            >
              Add Payment Method
            </button>
          )}
        </div>

        {showPaymentForm && (
          <form action={handlePaymentSubmit} className="mt-6 space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Add Payment Method</h3>
              <button
                type="button"
                onClick={() => setShowPaymentForm(false)}
                className="text-sm text-zinc-600 hover:text-zinc-900"
              >
                Cancel
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <div className="text-sm font-medium">Payment Type</div>
                <input
                  name="payment_type"
                  placeholder="credit_card, debit_card, cash, bank_transfer, paypal..."
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required
                />
              </label>
              <label className="flex items-center gap-2 pt-6">
                <input name="is_available" type="checkbox" defaultChecked />
                <span className="text-sm">Available</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800 disabled:bg-zinc-400"
              >
                {isPending ? "Adding..." : "Add Payment Method"}
              </button>
              <button
                type="button"
                onClick={() => setShowPaymentForm(false)}
                className="rounded-md border px-4 py-2 text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 rounded-lg border">
          <div className="border-b bg-zinc-50 p-3 text-sm font-medium">Payment Methods</div>
          <div className="divide-y">
            {paymentMethods.map((method) => (
              <div key={method.id} className="p-3">
                {editingPaymentId === method.id ? (
                  <form action={handlePaymentUpdate} className="space-y-4">
                    <input type="hidden" name="methodId" value={method.id} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <div className="text-sm font-medium">Payment Type</div>
                        <input
                          name="payment_type"
                          defaultValue={method.payment_type}
                          className="mt-1 w-full rounded-md border px-3 py-2"
                          required
                        />
                      </label>
                      <label className="flex items-center gap-2 pt-6">
                        <input
                          name="is_available"
                          type="checkbox"
                          defaultChecked={method.is_available}
                        />
                        <span className="text-sm">Available</span>
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
                        onClick={() => setEditingPaymentId(null)}
                        className="rounded-md border px-4 py-2 text-zinc-700 hover:bg-zinc-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{method.payment_type}</div>
                      <div className="text-xs text-zinc-500">
                        {method.is_available ? "Available" : "Not available"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingPaymentId(method.id)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <form action={deletePaymentMethod}>
                        <input type="hidden" name="methodId" value={method.id} />
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
            {paymentMethods.length === 0 ? (
              <div className="p-3 text-sm text-zinc-600">No payment methods yet.</div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Booking CTAs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Booking CTAs</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Add call-to-action buttons for bookings.
            </p>
          </div>
          {!showCTAForm && editingCTAId === null && (
            <button
              type="button"
              onClick={() => setShowCTAForm(true)}
              className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800"
            >
              Add CTA
            </button>
          )}
        </div>

        {showCTAForm && (
          <form action={handleCTASubmit} className="mt-6 space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Add Booking CTA</h3>
              <button
                type="button"
                onClick={() => setShowCTAForm(false)}
                className="text-sm text-zinc-600 hover:text-zinc-900"
              >
                Cancel
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <div className="text-sm font-medium">CTA Type</div>
                <select
                  name="cta_type"
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required
                >
                  <option value="">Select type</option>
                  <option value="book_now">Book Now</option>
                  <option value="enquire_now">Enquire Now</option>
                  <option value="call_to_book">Call to Book</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </label>
              <label className="block">
                <div className="text-sm font-medium">Label</div>
                <input
                  name="label"
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <div className="text-sm font-medium">URL (optional)</div>
                <input
                  name="url"
                  type="url"
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </label>
              <label className="block">
                <div className="text-sm font-medium">Phone Number (optional)</div>
                <input
                  name="phone_number"
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-2">
                <input name="is_active" type="checkbox" defaultChecked />
                <span className="text-sm">Active</span>
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
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800 disabled:bg-zinc-400"
              >
                {isPending ? "Adding..." : "Add CTA"}
              </button>
              <button
                type="button"
                onClick={() => setShowCTAForm(false)}
                className="rounded-md border px-4 py-2 text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 rounded-lg border">
          <div className="border-b bg-zinc-50 p-3 text-sm font-medium">Booking CTAs</div>
          <div className="divide-y">
            {ctas.map((cta) => (
              <div key={cta.id} className="p-3">
                {editingCTAId === cta.id ? (
                  <form action={handleCTAUpdate} className="space-y-4">
                    <input type="hidden" name="ctaId" value={cta.id} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <div className="text-sm font-medium">CTA Type</div>
                        <select
                          name="cta_type"
                          defaultValue={cta.cta_type}
                          className="mt-1 w-full rounded-md border px-3 py-2"
                          required
                        >
                          <option value="book_now">Book Now</option>
                          <option value="enquire_now">Enquire Now</option>
                          <option value="call_to_book">Call to Book</option>
                          <option value="whatsapp">WhatsApp</option>
                        </select>
                      </label>
                      <label className="block">
                        <div className="text-sm font-medium">Label</div>
                        <input
                          name="label"
                          defaultValue={cta.label}
                          className="mt-1 w-full rounded-md border px-3 py-2"
                          required
                        />
                      </label>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <div className="text-sm font-medium">URL (optional)</div>
                        <input
                          name="url"
                          type="url"
                          defaultValue={cta.url || ""}
                          className="mt-1 w-full rounded-md border px-3 py-2"
                        />
                      </label>
                      <label className="block">
                        <div className="text-sm font-medium">Phone Number (optional)</div>
                        <input
                          name="phone_number"
                          defaultValue={cta.phone_number || ""}
                          className="mt-1 w-full rounded-md border px-3 py-2"
                        />
                      </label>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="flex items-center gap-2">
                        <input
                          name="is_active"
                          type="checkbox"
                          defaultChecked={cta.is_active}
                        />
                        <span className="text-sm">Active</span>
                      </label>
                      <label className="block">
                        <div className="text-sm font-medium">Display Order</div>
                        <input
                          name="display_order"
                          type="number"
                          min="0"
                          defaultValue={cta.display_order || 0}
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
                        onClick={() => setEditingCTAId(null)}
                        className="rounded-md border px-4 py-2 text-zinc-700 hover:bg-zinc-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{cta.label}</div>
                      <div className="text-xs text-zinc-500">{cta.cta_type}</div>
                      {cta.url && (
                        <div className="text-xs text-blue-600">{cta.url}</div>
                      )}
                      {cta.phone_number && (
                        <div className="text-xs text-zinc-500">{cta.phone_number}</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingCTAId(cta.id)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <form action={deleteCTA}>
                        <input type="hidden" name="ctaId" value={cta.id} />
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
            {ctas.length === 0 ? (
              <div className="p-3 text-sm text-zinc-600">No CTAs yet.</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
