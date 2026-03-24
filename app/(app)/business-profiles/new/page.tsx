import Link from "next/link";

import { BusinessProfileForm } from "@/components/business-profile-form";
import { PageHeader } from "@/components/page-header";
import { createBusinessProfileAction } from "@/app/(app)/business-profiles/actions";

export default function NewBusinessProfilePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace"
        title="Create Business Profile"
        description="Add the basics first. You can save partial information now and complete the remaining scoring fields later."
        actions={
          <Link className="button-secondary" href="/business-profiles">
            Back to profiles
          </Link>
        }
      />

      <BusinessProfileForm action={createBusinessProfileAction} submitLabel="Create business profile" />
    </div>
  );
}
