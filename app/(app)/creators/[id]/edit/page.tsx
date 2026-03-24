import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CreatorForm } from "@/components/creator-form";
import { PageHeader } from "@/components/page-header";
import { db } from "@/lib/db";
import { updateCreatorAction } from "@/app/(app)/creators/actions";

export default async function EditCreatorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const creator = await db.creator.findUnique({
    where: {
      id,
    },
  });

  if (!creator) {
    notFound();
  }

  if (creator.sourceType !== "MANUAL") {
    redirect(`/creators/${creator.id}`);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Creator Library"
        title={`Edit ${creator.displayName}`}
        description="Update the creator details you have on hand. Pitchfluence v1 only ranks manual entries and the built-in demo library."
        actions={
          <Link className="button-secondary" href={`/creators/${creator.id}`}>
            Back to creator
          </Link>
        }
      />

      <CreatorForm action={updateCreatorAction.bind(null, creator.id)} initialValues={creator} submitLabel="Save changes" />
    </div>
  );
}
