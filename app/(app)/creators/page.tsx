import Link from "next/link";

import { Badge } from "@/components/badge";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { getSelectedBusinessProfile, getMissingBusinessFieldsForScoring } from "@/lib/business";
import {
  creatorPlatformLabels,
  creatorPlatformValues,
  creatorSourceTypeLabels,
  creatorSourceTypeValues,
  followerBandLabels,
  followerBandValues,
} from "@/lib/constants";
import { formatFollowerCount, formatPlatform, formatSourceType } from "@/lib/format";
import { getCreatorsForList } from "@/lib/workspace";
import { shortlistCreatorAction } from "@/app/(app)/creators/actions";

type SearchParams = Record<string, string | string[] | undefined>;

function getStringValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function CreatorsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const selectedBusiness = await getSelectedBusinessProfile();
  const filters = {
    search: getStringValue(params.search),
    platform: getStringValue(params.platform),
    sourceType: getStringValue(params.sourceType),
    region: getStringValue(params.region),
    followerBand: getStringValue(params.followerBand),
    niche: getStringValue(params.niche),
  };
  const creatorRows = await getCreatorsForList(selectedBusiness?.id, filters);
  const missingFields = selectedBusiness ? getMissingBusinessFieldsForScoring(selectedBusiness) : [];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Creator Library"
        title="Creators"
        description="Browse the built-in demo creator library, add manual creators, and rank them against the selected business profile."
        actions={
          <>
            <Link className="button-secondary" href="/creators/new">
              Add manual creator
            </Link>
            <Link className="button-primary" href="/outreach">
              Go to outreach
            </Link>
          </>
        }
      />

      <section className="card-surface space-y-4 p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink-900">Demo Creator Library + Manual Creators</h2>
            <p className="text-sm text-ink-600">
              This is not live influencer discovery. Results are ranked from your seeded demo creators and manual entries.
            </p>
          </div>
          {selectedBusiness ? (
            <Badge tone={missingFields.length ? "warn" : "brand"}>
              {missingFields.length
                ? `${selectedBusiness.name} needs ${missingFields.length} scoring fields`
                : `Scoring with ${selectedBusiness.name}`}
            </Badge>
          ) : (
            <Badge tone="warn">Create a business profile to score creators</Badge>
          )}
        </div>

        <form className="grid gap-3 lg:grid-cols-6" method="get">
          <input className="input lg:col-span-2" defaultValue={filters.search} name="search" placeholder="Search name, handle, bio..." />
          <select className="select" defaultValue={filters.platform} name="platform">
            <option value="">All platforms</option>
            {creatorPlatformValues.map((value) => (
              <option key={value} value={value}>
                {creatorPlatformLabels[value]}
              </option>
            ))}
          </select>
          <select className="select" defaultValue={filters.sourceType} name="sourceType">
            <option value="">All sources</option>
            {creatorSourceTypeValues.map((value) => (
              <option key={value} value={value}>
                {creatorSourceTypeLabels[value]}
              </option>
            ))}
          </select>
          <input className="input" defaultValue={filters.region} name="region" placeholder="Region" />
          <select className="select" defaultValue={filters.followerBand} name="followerBand">
            <option value="">All follower bands</option>
            {followerBandValues.map((value) => (
              <option key={value} value={value}>
                {followerBandLabels[value]}
              </option>
            ))}
          </select>
          <input className="input lg:col-span-2" defaultValue={filters.niche} name="niche" placeholder="Niche tag" />
          <div className="flex gap-3 lg:col-span-4">
            <button className="button-primary" type="submit">
              Apply filters
            </button>
            <Link className="button-secondary" href="/creators">
              Reset
            </Link>
          </div>
        </form>
      </section>

      {!creatorRows.length ? (
        <EmptyState
          title="No creators match these filters"
          body="Try broadening the filters or add a manual creator to keep building your list."
          action={
            <Link className="button-primary" href="/creators/new">
              Add creator
            </Link>
          }
        />
      ) : (
        <section className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-ink-100">
              <thead className="bg-ink-50/80">
                <tr className="text-left text-xs uppercase tracking-[0.12em] text-ink-500">
                  <th className="px-5 py-4">Creator</th>
                  <th className="px-5 py-4">Source</th>
                  <th className="px-5 py-4">Platform</th>
                  <th className="px-5 py-4">Follower size</th>
                  <th className="px-5 py-4">Score</th>
                  <th className="px-5 py-4">Fit</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 bg-white">
                {creatorRows.map(({ creator, match, pipelineItem }) => (
                  <tr key={creator.id} className="align-top">
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <Link className="font-semibold text-ink-900 hover:text-brand-700" href={`/creators/${creator.id}`}>
                          {creator.displayName}
                        </Link>
                        <p className="text-sm text-ink-500">{creator.handle}</p>
                        <p className="max-w-xs text-sm text-ink-600">{creator.bio ?? "No bio added yet."}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-ink-600">{formatSourceType(creator.sourceType)}</td>
                    <td className="px-5 py-4 text-sm text-ink-600">{formatPlatform(creator.platform)}</td>
                    <td className="px-5 py-4 text-sm text-ink-600">{formatFollowerCount(creator.followerCount)}</td>
                    <td className="px-5 py-4">
                      {match ? (
                        <div className="space-y-1">
                          <p className="text-lg font-semibold text-ink-900">{match.overallScore}</p>
                          <p className="text-xs text-ink-500">{match.mainReason}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-ink-400">Select a business</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {match ? (
                        <div className="space-y-2">
                          <Badge tone={match.fitLevel === "STRONG" ? "success" : match.fitLevel === "POSSIBLE" ? "brand" : "warn"}>
                            {match.fitLevel === "STRONG"
                              ? "Strong fit"
                              : match.fitLevel === "POSSIBLE"
                                ? "Possible fit"
                                : "Low fit"}
                          </Badge>
                          <p className="max-w-xs text-xs text-ink-500">{match.softWarningMessage ?? "Looks like a practical outreach candidate."}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-ink-400">Unavailable</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-2">
                        <Link className="button-secondary" href={`/creators/${creator.id}`}>
                          View
                        </Link>
                        {selectedBusiness && match ? (
                          pipelineItem ? (
                            <Link className="button-secondary" href={`/pipeline/${pipelineItem.id}`}>
                              In pipeline
                            </Link>
                          ) : (
                            <form action={shortlistCreatorAction}>
                              <input name="businessProfileId" type="hidden" value={selectedBusiness.id} />
                              <input name="creatorId" type="hidden" value={creator.id} />
                              <input name="redirectTo" type="hidden" value="/creators" />
                              <button className="button-primary w-full" disabled={Boolean(missingFields.length)} type="submit">
                                Shortlist
                              </button>
                            </form>
                          )
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
