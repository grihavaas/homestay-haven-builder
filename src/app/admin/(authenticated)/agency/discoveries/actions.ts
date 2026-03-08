"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

export async function startCrawl(listingUrls: string[], reviewUrls: string[]) {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { success: false, error: "Not authenticated" };
  }

  const res = await fetch(`${env.backendServiceUrl}/api/crawl-extract`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ listingUrls, reviewUrls }),
  });

  const data = await res.json();
  if (!res.ok) {
    return { success: false, error: data.error || "Failed to start discovery" };
  }

  return { success: true, jobId: data.jobId };
}

export async function reExtractJob(jobId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { success: false, error: "Not authenticated" };
  }

  const res = await fetch(`${env.backendServiceUrl}/api/crawl-jobs/${jobId}/re-extract`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!res.ok) {
    const data = await res.json();
    return { success: false, error: data.error || "Failed to start re-extraction" };
  }

  return { success: true };
}

export async function deleteCrawlJob(jobId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { success: false, error: "Not authenticated" };
  }

  const res = await fetch(`${env.backendServiceUrl}/api/crawl-jobs/${jobId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!res.ok) {
    const data = await res.json();
    return { success: false, error: data.error || "Failed to delete job" };
  }

  return { success: true };
}
