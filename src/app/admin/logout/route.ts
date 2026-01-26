import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  // Use relative redirect instead of absolute URL
  redirect("/admin/login");
}
