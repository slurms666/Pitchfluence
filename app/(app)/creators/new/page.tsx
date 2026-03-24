import Link from "next/link";

import { CreatorForm } from "@/components/creator-form";
import { PageHeader } from "@/components/page-header";
import { createCreatorAction } from "@/app/(app)/creators/actions";

export default function NewCreatorPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Creator Library"
        title="Add Manual Creator"
        description="Pitchfluence v1 does not scrape live creators. Use this form to add someone you already know you want to evaluate."
        actions={
          <Link className="button-secondary" href="/creators">
            Back to creators
          </Link>
        }
      />

      <CreatorForm action={createCreatorAction} submitLabel="Save creator" />
    </div>
  );
}
