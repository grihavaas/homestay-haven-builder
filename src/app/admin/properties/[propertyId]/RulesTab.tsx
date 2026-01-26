import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RulesManager } from "./RulesManager";

async function listRules(propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("rules_and_policies")
    .select("id,rule_type,rule_text,display_order")
    .eq("property_id", propertyId)
    .order("display_order")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function RulesTab({
  propertyId,
  tenantId,
}: {
  propertyId: string;
  tenantId: string;
}) {
  const rules = await listRules(propertyId);

  async function createRule(formData: FormData) {
    "use server";
    const ruleType = String(formData.get("rule_type") ?? "").trim();
    const ruleText = String(formData.get("rule_text") ?? "").trim();
    if (!ruleType || !ruleText) return;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("rules_and_policies").insert({
      property_id: propertyId,
      tenant_id: tenantId,
      rule_type: ruleType,
      rule_text: ruleText,
      display_order: Number(formData.get("display_order")) || 0,
    });
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function updateRule(formData: FormData) {
    "use server";
    const ruleId = String(formData.get("ruleId"));
    const ruleType = String(formData.get("rule_type") ?? "").trim();
    const ruleText = String(formData.get("rule_text") ?? "").trim();
    if (!ruleType || !ruleText) return;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("rules_and_policies")
      .update({
        rule_type: ruleType,
        rule_text: ruleText,
        display_order: Number(formData.get("display_order")) || 0,
      })
      .eq("id", ruleId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function deleteRule(ruleId: string) {
    "use server";
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("rules_and_policies")
      .delete()
      .eq("id", ruleId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  return (
    <RulesManager
      propertyId={propertyId}
      tenantId={tenantId}
      rules={rules}
      createRule={createRule}
      updateRule={updateRule}
      deleteRule={deleteRule}
    />
  );
}
