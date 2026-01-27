import Link from "next/link";
import { Suspense } from "react";

import { requireMembership } from "@/lib/authz";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PropertyTabs } from "@/components/PropertyTabs";
import { DeletePropertyButton } from "@/components/DeletePropertyButton";
import { BasicInfoTab } from "./BasicInfoTab";
import { RoomsTab } from "./RoomsTab";
import { AmenitiesTagsTab } from "./AmenitiesTagsTab";
import { MediaTab } from "./MediaTab";
import { HostsTab } from "./HostsTab";
import { ReviewsTab } from "./ReviewsTab";
import { RulesTab } from "./RulesTab";
import { AttractionsTab } from "./AttractionsTab";
import { BookingTab } from "./BookingTab";
import { PricingTab } from "./PricingTab";
import { PromotionsTab } from "./PromotionsTab";
import { AdditionalTab } from "./AdditionalTab";

async function getProperty(propertyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select(
      "id,tenant_id,name,type,tagline,description,classification,slug,city,state,country,postal_code,street_address,location_description,latitude,longitude,is_published,is_active,updated_at,feature_seo_elements,review_summary,room_section_header,room_section_tagline",
    )
    .eq("id", propertyId)
    .single();
  if (error) throw error;
  return data;
}

export default async function TenantPropertyEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ propertyId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const membership = await requireMembership();
  const { propertyId } = await params;
  const { tab = "basic" } = await searchParams;
  const property = await getProperty(propertyId);

  // Explicitly verify tenant ownership (defense in depth - RLS should already block this)
  // Agency admins can access any property, tenant admins can only access their tenant's properties
  if (membership.role !== "agency_admin" && property.tenant_id !== membership.tenant_id) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="mt-2 text-sm text-zinc-600">
          You do not have access to this property.
        </p>
        <Link className="mt-4 inline-block underline" href="/admin/properties">
          Back to properties
        </Link>
      </div>
    );
  }

  function renderTab() {
    switch (tab) {
      case "basic":
        return <BasicInfoTab property={property} />;
      case "rooms":
        return <RoomsTab propertyId={propertyId} tenantId={property.tenant_id} />;
      case "amenities":
        return <AmenitiesTagsTab propertyId={propertyId} tenantId={property.tenant_id} />;
      case "media":
        return <MediaTab propertyId={propertyId} tenantId={property.tenant_id} />;
      case "hosts":
        return <HostsTab propertyId={propertyId} tenantId={property.tenant_id} />;
      case "reviews":
        return <ReviewsTab propertyId={propertyId} tenantId={property.tenant_id} reviewSummary={property.review_summary} />;
      case "rules":
        return <RulesTab propertyId={propertyId} tenantId={property.tenant_id} />;
      case "attractions":
        return <AttractionsTab propertyId={propertyId} tenantId={property.tenant_id} />;
      case "booking":
        return <BookingTab propertyId={propertyId} tenantId={property.tenant_id} />;
      case "pricing":
        return <PricingTab propertyId={propertyId} tenantId={property.tenant_id} />;
      case "promotions":
        return <PromotionsTab propertyId={propertyId} tenantId={property.tenant_id} />;
      case "additional":
        return <AdditionalTab propertyId={propertyId} tenantId={property.tenant_id} />;
      default:
        return <BasicInfoTab property={property} />;
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-8">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{property.name}</h1>
          <div className="mt-1 font-mono text-xs text-zinc-500">{property.id}</div>
          <div className="mt-1 text-sm text-zinc-600">
            Slug: <span className="font-mono">{property.slug}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link className="underline" href="/admin/properties">
            Back to properties
          </Link>
          {(membership.role === "tenant_admin" || membership.role === "agency_admin") && (
            <DeletePropertyButton propertyId={propertyId} propertyName={property.name} />
          )}
        </div>
      </div>

      <div className="mt-6">
        <Suspense fallback={<div>Loading...</div>}>
          <PropertyTabs propertyId={propertyId} />
        </Suspense>
        <div className="mt-6">{renderTab()}</div>
      </div>
    </div>
  );
}

