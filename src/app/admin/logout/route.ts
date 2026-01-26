import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Use POST for logout to prevent prefetch issues
// GET requests can be prefetched by <Link> components, accidentally triggering logout
export async function POST() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// Keep GET for backwards compatibility but discourage its use
export async function GET() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
