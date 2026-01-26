import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HostsManager } from "./HostsManager";

async function listHosts(propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: hosts, error: hostsError } = await supabase
    .from("hosts")
    .select("id,name,title,bio,writeup,email,phone,whatsapp,response_time")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });
  if (hostsError) throw hostsError;
  
  // Fetch languages for each host
  if (hosts && hosts.length > 0) {
    const hostIds = hosts.map((h) => h.id);
    const { data: languages, error: langError } = await supabase
      .from("host_languages")
      .select("host_id,language")
      .in("host_id", hostIds);
    
    if (langError) throw langError;
    
    // Attach languages to hosts
    return hosts.map((host) => ({
      ...host,
      languages: (languages ?? [])
        .filter((hl) => hl.host_id === host.id)
        .map((hl) => hl.language),
    }));
  }
  
  return hosts ?? [];
}

export async function HostsTab({
  propertyId,
  tenantId,
}: {
  propertyId: string;
  tenantId: string;
}) {
  const hosts = await listHosts(propertyId);

  async function createHost(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return;

    const supabase = await createSupabaseServerClient();
    const { data: host, error } = await supabase.from("hosts").insert({
      property_id: propertyId,
      tenant_id: tenantId,
      name,
      title: String(formData.get("title") ?? "").trim() || null,
      bio: String(formData.get("bio") ?? "").trim() || null,
      writeup: String(formData.get("writeup") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      whatsapp: String(formData.get("whatsapp") ?? "").trim() || null,
      response_time: String(formData.get("response_time") ?? "").trim() || null,
    }).select().single();
    
    if (error) throw error;
    
    // Handle languages
    const languagesJson = String(formData.get("languages") ?? "[]");
    try {
      const languages: string[] = JSON.parse(languagesJson);
      if (languages.length > 0 && host) {
        const languageInserts = languages.map((lang) => ({
          host_id: host.id,
          language: lang.trim(),
        }));
        const { error: langError } = await supabase
          .from("host_languages")
          .insert(languageInserts);
        if (langError) throw langError;
      }
    } catch (e) {
      // Invalid JSON, skip languages
    }
    
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function updateHost(formData: FormData) {
    "use server";
    const hostId = String(formData.get("hostId"));
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("hosts")
      .update({
        name,
        title: String(formData.get("title") ?? "").trim() || null,
        bio: String(formData.get("bio") ?? "").trim() || null,
        writeup: String(formData.get("writeup") ?? "").trim() || null,
        email: String(formData.get("email") ?? "").trim() || null,
        phone: String(formData.get("phone") ?? "").trim() || null,
        whatsapp: String(formData.get("whatsapp") ?? "").trim() || null,
        response_time: String(formData.get("response_time") ?? "").trim() || null,
      })
      .eq("id", hostId);
    if (error) throw error;
    
    // Update languages - delete existing and insert new
    const languagesJson = String(formData.get("languages") ?? "[]");
    try {
      const languages: string[] = JSON.parse(languagesJson);
      
      // Delete existing languages
      const { error: deleteError } = await supabase
        .from("host_languages")
        .delete()
        .eq("host_id", hostId);
      if (deleteError) throw deleteError;
      
      // Insert new languages
      if (languages.length > 0) {
        const languageInserts = languages.map((lang) => ({
          host_id: hostId,
          language: lang.trim(),
        }));
        const { error: insertError } = await supabase
          .from("host_languages")
          .insert(languageInserts);
        if (insertError) throw insertError;
      }
    } catch (e) {
      // Invalid JSON, skip languages
    }
    
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  async function deleteHost(formData: FormData) {
    "use server";
    const hostId = String(formData.get("hostId"));
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("hosts").delete().eq("id", hostId);
    if (error) throw error;
    revalidatePath(`/admin/properties/${propertyId}`);
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">Hosts</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Manage host information for this property.
      </p>

      <HostsManager
        hosts={hosts}
        createHost={createHost}
        updateHost={updateHost}
        deleteHost={deleteHost}
      />
    </div>
  );
}
