"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Rule {
  id: string;
  rule_type: string;
  rule_text: string;
  display_order: number | null;
}

interface RulesManagerProps {
  propertyId: string;
  tenantId: string;
  rules: Rule[];
  createRule: (formData: FormData) => Promise<void>;
  updateRule: (formData: FormData) => Promise<void>;
  deleteRule: (ruleId: string) => Promise<void>;
}

export function RulesManager({
  propertyId,
  tenantId,
  rules,
  createRule,
  updateRule,
  deleteRule,
}: RulesManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  async function handleCreateSubmit(formData: FormData) {
    await createRule(formData);
    startTransition(() => {
      router.refresh();
      setShowForm(false);
    });
  }

  async function handleUpdateSubmit(formData: FormData) {
    await updateRule(formData);
    startTransition(() => {
      router.refresh();
      setEditingRuleId(null);
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Rules & Policies</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Manage house rules, policies, and important information.
          </p>
        </div>
        {!showForm && editingRuleId === null && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800"
          >
            Add Rule
          </button>
        )}
      </div>

      {showForm && (
        <form action={handleCreateSubmit} className="mt-6 space-y-4 rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Add Rule or Policy</h3>
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
              <div className="text-sm font-medium">Rule Type</div>
              <select
                name="rule_type"
                className="mt-1 w-full rounded-md border px-3 py-2"
                required
              >
                <option value="">Select type</option>
                <option value="house_rules">House Rules</option>
                <option value="check_in_requirements">Check-in Requirements</option>
                <option value="cancellation">Cancellation Policy</option>
                <option value="terms">Terms & Conditions</option>
                <option value="privacy">Privacy Policy</option>
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
            <div className="text-sm font-medium">Rule Text</div>
            <textarea
              name="rule_text"
              className="mt-1 w-full rounded-md border px-3 py-2"
              rows={4}
              required
            />
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800 disabled:bg-zinc-400"
            >
              {isPending ? "Adding..." : "Add Rule"}
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
        <div className="grid grid-cols-[1fr_2fr_auto] gap-2 border-b bg-zinc-50 p-3 text-sm font-medium">
          <div>Type</div>
          <div>Rule</div>
          <div>Actions</div>
        </div>
        <div className="divide-y">
          {rules.map((rule) => (
            <div key={rule.id} className="p-3">
              {editingRuleId === rule.id ? (
                <form action={handleUpdateSubmit} className="space-y-4">
                  <input type="hidden" name="ruleId" value={rule.id} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <div className="text-sm font-medium">Rule Type</div>
                      <select
                        name="rule_type"
                        defaultValue={rule.rule_type}
                        className="mt-1 w-full rounded-md border px-3 py-2"
                        required
                      >
                        <option value="house_rules">House Rules</option>
                        <option value="check_in_requirements">Check-in Requirements</option>
                        <option value="cancellation">Cancellation Policy</option>
                        <option value="terms">Terms & Conditions</option>
                        <option value="privacy">Privacy Policy</option>
                      </select>
                    </label>
                    <label className="block">
                      <div className="text-sm font-medium">Display Order</div>
                      <input
                        name="display_order"
                        type="number"
                        min="0"
                        defaultValue={rule.display_order || 0}
                        className="mt-1 w-full rounded-md border px-3 py-2"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <div className="text-sm font-medium">Rule Text</div>
                    <textarea
                      name="rule_text"
                      defaultValue={rule.rule_text}
                      className="mt-1 w-full rounded-md border px-3 py-2"
                      rows={4}
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
                      onClick={() => setEditingRuleId(null)}
                      className="rounded-md border px-4 py-2 text-zinc-700 hover:bg-zinc-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-[1fr_2fr_auto] gap-2 text-sm">
                  <div className="font-medium">{rule.rule_type.replace("_", " ")}</div>
                  <div>{rule.rule_text}</div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingRuleId(rule.id)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <form action={deleteRule.bind(null, rule.id)}>
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
          {rules.length === 0 ? (
            <div className="p-3 text-sm text-zinc-600">No rules yet.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
