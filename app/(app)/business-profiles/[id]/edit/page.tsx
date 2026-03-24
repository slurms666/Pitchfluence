import Link from "next/link";
import { notFound } from "next/navigation";

import { BusinessProfileForm } from "@/components/business-profile-form";
import { PageHeader } from "@/components/page-header";
import { db } from "@/lib/db";
import { updateBusinessProfileAction } from "@/app/(app)/business-profiles/actions";

export default async function EditBusinessProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const business = await db.businessProfile.findUnique({
    where: {
      id,
    },
  });

  if (!business) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace"
        title={`Edit ${business.name}`}
        description="Update positioning, budget, and proof points to improve fit scoring and outreach suggestions."
        actions={
          <Link className="button-secondary" href={`/business-profiles/${business.id}`}>
            Back to profile
          </Link>
        }
      />

      <BusinessProfileForm
        action={updateBusinessProfileAction.bind(null, business.id)}
        initialValues={business}
        submitLabel="Save changes"
      />
    </div>
  );
}
