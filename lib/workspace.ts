import "server-only";

import { startOfDay } from "date-fns";

import { pipelineStageValues, stageOrder } from "@/lib/constants";
import { db } from "@/lib/db";
import { rankCreatorsForBusiness, scoreCreatorForBusiness } from "@/lib/scoring";

type CreatorFilters = {
  search?: string;
  platform?: string;
  sourceType?: string;
  region?: string;
  followerBand?: string;
  niche?: string;
};

export async function getDashboardSnapshot(selectedBusinessId?: string | null) {
  const [
    businessProfiles,
    creators,
    pipelineItems,
    openReminders,
    recentActivities,
    selectedBusiness,
  ] = await Promise.all([
    db.businessProfile.findMany({ orderBy: { updatedAt: "desc" } }),
    db.creator.findMany({ orderBy: { createdAt: "desc" } }),
    db.pipelineItem.findMany({
      include: {
        creator: true,
        businessProfile: true,
      },
    }),
    db.reminder.findMany({
      where: {
        status: "OPEN",
      },
      include: {
        pipelineItem: {
          include: {
            creator: true,
            businessProfile: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
      take: 6,
    }),
    db.activity.findMany({
      include: {
        pipelineItem: {
          include: {
            creator: true,
            businessProfile: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
    }),
    selectedBusinessId
      ? db.businessProfile.findUnique({
          where: {
            id: selectedBusinessId,
          },
        })
      : null,
  ]);

  const activePipelineCount = pipelineItems.filter(
    (item) => item.currentStage !== "COMPLETED" && item.currentStage !== "REJECTED",
  ).length;
  const shortlistedCount = pipelineItems.filter((item) => item.currentStage === "SHORTLISTED").length;
  const remindersDueSoon = openReminders.filter((reminder) => {
    const dueDate = new Date(reminder.dueDate);
    const now = startOfDay(new Date());
    const diff = dueDate.getTime() - now.getTime();
    return diff <= 1000 * 60 * 60 * 24 * 7;
  });

  const topMatches =
    selectedBusiness != null
      ? rankCreatorsForBusiness(selectedBusiness, creators)
          .slice(0, 5)
          .map(({ creator, match }) => ({
            creator,
            match,
            pipelineItem: pipelineItems.find(
              (item) =>
                item.businessProfileId === selectedBusiness.id && item.creatorId === creator.id,
            ),
          }))
      : [];

  return {
    selectedBusiness,
    totalBusinessProfiles: businessProfiles.length,
    totalCreators: creators.length,
    totalDemoCreators: creators.filter((creator) => creator.sourceType === "DEMO").length,
    totalManualCreators: creators.filter((creator) => creator.sourceType === "MANUAL").length,
    shortlistedCount,
    activePipelineCount,
    remindersDueSoonCount: remindersDueSoon.length,
    remindersDueSoon,
    recentActivities,
    topMatches,
  };
}

export async function getCreatorsForList(selectedBusinessId?: string | null, filters: CreatorFilters = {}) {
  const creators = await db.creator.findMany({
    orderBy: {
      updatedAt: "desc",
    },
  });

  const selectedBusiness = selectedBusinessId
    ? await db.businessProfile.findUnique({
        where: {
          id: selectedBusinessId,
        },
      })
    : null;

  const pipelineItems = selectedBusiness
    ? await db.pipelineItem.findMany({
        where: {
          businessProfileId: selectedBusiness.id,
        },
      })
    : [];

  let filtered = creators;

  if (filters.search) {
    const needle = filters.search.toLowerCase();
    filtered = filtered.filter((creator) =>
      [creator.displayName, creator.handle, creator.bio, creator.audienceNotes]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }

  if (filters.platform) {
    filtered = filtered.filter((creator) => creator.platform === filters.platform);
  }

  if (filters.sourceType) {
    filtered = filtered.filter((creator) => creator.sourceType === filters.sourceType);
  }

  if (filters.region) {
    const region = filters.region.toLowerCase();
    filtered = filtered.filter((creator) =>
      [creator.targetRegion, creator.creatorLocation].filter(Boolean).join(" ").toLowerCase().includes(region),
    );
  }

  if (filters.followerBand) {
    filtered = filtered.filter((creator) => creator.followerBand === filters.followerBand);
  }

  if (filters.niche) {
    const niche = filters.niche.toLowerCase();
    filtered = filtered.filter((creator) =>
      creator.nicheTags.join(" ").toLowerCase().includes(niche),
    );
  }

  if (!selectedBusiness) {
    return filtered.map((creator) => ({
      creator,
      match: null,
      pipelineItem: null,
    }));
  }

  return rankCreatorsForBusiness(selectedBusiness, filtered).map(({ creator, match }) => ({
    creator,
    match,
    pipelineItem:
      pipelineItems.find((item) => item.creatorId === creator.id && item.businessProfileId === selectedBusiness.id) ??
      null,
  }));
}

export async function getCreatorPageData(creatorId: string, selectedBusinessId?: string | null) {
  const creator = await db.creator.findUnique({
    where: {
      id: creatorId,
    },
  });

  if (!creator) {
    return null;
  }

  const [selectedBusiness, savedDrafts, pipelineItem] = await Promise.all([
    selectedBusinessId
      ? db.businessProfile.findUnique({
          where: {
            id: selectedBusinessId,
          },
        })
      : null,
    selectedBusinessId
      ? db.outreachDraft.findMany({
          where: {
            businessProfileId: selectedBusinessId,
            creatorId,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        })
      : [],
    selectedBusinessId
      ? db.pipelineItem.findUnique({
          where: {
            businessProfileId_creatorId: {
              businessProfileId: selectedBusinessId,
              creatorId,
            },
          },
        })
      : null,
  ]);

  const match = selectedBusiness ? scoreCreatorForBusiness(selectedBusiness, creator) : null;

  return {
    creator,
    selectedBusiness,
    match,
    pipelineItem,
    savedDrafts,
  };
}

export async function upsertCreatorMatch(businessProfileId: string, creatorId: string) {
  const [business, creator] = await Promise.all([
    db.businessProfile.findUniqueOrThrow({
      where: {
        id: businessProfileId,
      },
    }),
    db.creator.findUniqueOrThrow({
      where: {
        id: creatorId,
      },
    }),
  ]);

  const match = scoreCreatorForBusiness(business, creator);

  return db.creatorMatch.upsert({
    where: {
      businessProfileId_creatorId: {
        businessProfileId,
        creatorId,
      },
    },
    create: {
      businessProfileId,
      creatorId,
      ...match,
    },
    update: match,
  });
}

export async function createShortlistPipelineItem(businessProfileId: string, creatorId: string) {
  const match = await upsertCreatorMatch(businessProfileId, creatorId);
  const existing = await db.pipelineItem.findUnique({
    where: {
      businessProfileId_creatorId: {
        businessProfileId,
        creatorId,
      },
    },
  });

  if (existing) {
    return db.pipelineItem.update({
      where: {
        id: existing.id,
      },
      data: {
        creatorMatchId: match.id,
        recommendedCollaborationType: match.recommendedCollaborationType,
        latestOverallScore: match.overallScore,
        latestScoreSummary: match.mainReason,
      },
    });
  }

  const pipelineItem = await db.pipelineItem.create({
    data: {
      businessProfileId,
      creatorId,
      currentStage: "SHORTLISTED",
      creatorMatchId: match.id,
      recommendedCollaborationType: match.recommendedCollaborationType,
      latestOverallScore: match.overallScore,
      latestScoreSummary: match.mainReason,
    },
  });

  await db.activity.create({
    data: {
      pipelineItemId: pipelineItem.id,
      kind: "PIPELINE_CREATED",
      message: "Creator shortlisted and added to the pipeline.",
    },
  });

  return pipelineItem;
}

export async function logActivity(pipelineItemId: string, kind: Parameters<typeof db.activity.create>[0]["data"]["kind"], message: string) {
  return db.activity.create({
    data: {
      pipelineItemId,
      kind,
      message,
    },
  });
}

export async function getPipelinePageData(filters: {
  businessProfileId?: string | null;
  stage?: string | null;
  sort?: string | null;
}) {
  const [businessProfiles, pipelineItems] = await Promise.all([
    db.businessProfile.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    db.pipelineItem.findMany({
      include: {
        creator: true,
        businessProfile: true,
        reminders: {
          where: {
            status: "OPEN",
          },
          orderBy: {
            dueDate: "asc",
          },
          take: 2,
        },
      },
    }),
  ]);

  let items = pipelineItems;

  if (filters.businessProfileId) {
    items = items.filter((item) => item.businessProfileId === filters.businessProfileId);
  }

  if (filters.stage) {
    items = items.filter((item) => item.currentStage === filters.stage);
  }

  switch (filters.sort) {
    case "creator":
      items = [...items].sort((left, right) => left.creator.displayName.localeCompare(right.creator.displayName));
      break;
    case "score":
      items = [...items].sort((left, right) => (right.latestOverallScore ?? 0) - (left.latestOverallScore ?? 0));
      break;
    case "updated":
      items = [...items].sort(
        (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
      );
      break;
    default:
      items = [...items].sort((left, right) => stageOrder[left.currentStage] - stageOrder[right.currentStage]);
  }

  const grouped = pipelineStageValues.map((stage) => ({
    stage,
    items: items
      .filter((item) => item.currentStage === stage)
      .sort((left, right) => (right.latestOverallScore ?? 0) - (left.latestOverallScore ?? 0)),
  }));

  return {
    businessProfiles,
    items,
    grouped,
  };
}

export async function getPipelineItemDetail(id: string) {
  return db.pipelineItem.findUnique({
    where: {
      id,
    },
    include: {
      businessProfile: true,
      creator: true,
      creatorMatch: true,
      notes: {
        orderBy: {
          createdAt: "desc",
        },
      },
      reminders: {
        orderBy: {
          dueDate: "asc",
        },
      },
      activities: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}
