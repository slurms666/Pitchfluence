import Link from "next/link";

import { Badge } from "@/components/badge";
import { OutreachGenerator } from "@/components/outreach-generator";
import { PageHeader } from "@/components/page-header";
import { getSelectedBusinessProfile } from "@/lib/business";
import { db } from "@/lib/db";

type SearchParams = Record<string, string | string[] | undefined>;

function getStringValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function OutreachPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const selectedBusiness = await getSelectedBusinessProfile();
  const businessId = getStringValue(params.businessId) || selectedBusiness?.id || "";
  const creatorId = getStringValue(params.creatorId);
  const saved = getStringValue(params.saved);

  const [businesses, creators, drafts] = await Promise.all([
    db.businessProfile.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    }),
    db.creator.findMany({
      orderBy: {
        displayName: "asc",
      },
      select: {
        id: true,
        displayName: true,
        handle: true,
      },
    }),
    db.outreachDraft.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
      include: {
        businessProfile: true,
        creator: true,
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Outreach Generator"
        title="Outreach"
        description="Generate structured outreach templates for email, Instagram DM, and TikTok DM. Everything in v1 works without paid AI."
        actions={
          <>
            {saved === "1" ? <Badge tone="success">Draft saved</Badge> : null}
            <Link className="button-secondary" href="/pipeline">
              Open pipeline
            </Link>
          </>
        }
      />

      <OutreachGenerator
        businesses={businesses}
        creators={creators}
        defaults={{
          businessProfileId: businessId || undefined,
          creatorId: creatorId || undefined,
        }}
      />

      <section className="card-surface space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink-900">Saved drafts</h2>
            <p className="text-sm text-ink-600">Recent drafts saved from this workspace.</p>
          </div>
          <Badge>{drafts.length}</Badge>
        </div>
        <div className="space-y-3">
          {drafts.length ? (
            drafts.map((draft) => (
              <article key={draft.id} className="rounded-3xl border border-ink-100 bg-ink-50 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink-900">
                      {draft.subjectLine ?? `${draft.channel.replaceAll("_", " ")} draft`}
                    </p>
                    <p className="mt-1 text-sm text-ink-600">
                      {draft.creator.displayName} for {draft.businessProfile.name}
                    </p>
                  </div>
                  <Link
                    className="button-secondary"
                    href={`/outreach?businessId=${draft.businessProfileId}&creatorId=${draft.creatorId}`}
                  >
                    Regenerate
                  </Link>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-ink-700">{draft.body}</p>
              </article>
            ))
          ) : (
            <p className="text-sm text-ink-600">No saved drafts yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
