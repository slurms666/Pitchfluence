import type { PrismaClient } from "@prisma/client";

import { scoreCreatorForBusiness } from "@/lib/scoring";
import { followerBandFromCount } from "@/lib/utils";

const businessProfiles = [
  {
    slug: "luma-skin",
    name: "Luma Skin Co",
    website: "https://lumaskin.example.com",
    productOrServiceSummary:
      "science-backed skincare kits for busy professionals who want a simple glow routine",
    niche: "skincare beauty wellness",
    targetAudience: "women aged 24 to 40 who want low-fuss skincare and visible results",
    targetRegion: "Global English-speaking",
    budgetMin: 250,
    budgetMax: 1200,
    campaignGoal: "SALES_CONVERSIONS",
    socialProofLevel: "GROWING_BRAND",
    socialProofNotes: "Repeat customer base and a growing review library.",
    offerNotes: "Open to gifted first tests, paid creator whitelisting later, and before/after UGC.",
    brandToneDefault: "FRIENDLY",
  },
  {
    slug: "harbor-cup",
    name: "Harbor Cup Cafe",
    website: "https://harborcup.example.com",
    productOrServiceSummary:
      "an independent specialty cafe known for rotating pastries, seasonal drinks, and a welcoming local vibe",
    niche: "food cafe local lifestyle",
    targetAudience: "students, remote workers, and neighbourhood regulars looking for local cafe spots",
    targetRegion: "Toronto",
    budgetMin: 75,
    budgetMax: 350,
    campaignGoal: "LOCAL_FOOTFALL",
    socialProofLevel: "SOME_CUSTOMER_TRACTION",
    socialProofNotes: "Strong Google reviews and a busy brunch weekend crowd.",
    offerNotes: "Happy to offer menu tastings, a drinks package, or a small paid feature for a local creator.",
    brandToneDefault: "FRIENDLY",
  },
  {
    slug: "northline-coaching",
    name: "Northline Coaching",
    website: "https://northlinecoaching.example.com",
    productOrServiceSummary:
      "online strength coaching and habit-based programmes for professionals who want realistic fitness structure",
    niche: "fitness coaching wellness productivity",
    targetAudience: "busy adults who want sustainable strength training without extreme routines",
    targetRegion: "Global",
    budgetMin: 150,
    budgetMax: 900,
    campaignGoal: "USER_GENERATED_CONTENT",
    socialProofLevel: "SOME_CUSTOMER_TRACTION",
    socialProofNotes: "Growing testimonials and client transformation stories.",
    offerNotes: "Open to gifted programme access, UGC content, and affiliate testing.",
    brandToneDefault: "PROFESSIONAL",
  },
] as const;

const creators = [
  {
    sourceType: "DEMO",
    handle: "@mariaeatslocal",
    displayName: "Maria Eats Local",
    platform: "INSTAGRAM",
    bio: "Toronto cafe hunter sharing neighbourhood coffee spots, pastries, and calm city weekend guides.",
    nicheTags: ["food", "cafe", "toronto", "local lifestyle"],
    targetRegion: "Toronto",
    creatorLocation: "Toronto",
    followerCount: 18400,
    contentStyle: "Reels, photo carousels, menu reviews, and local small business spotlights.",
    audienceNotes: "Local young professionals and students who love discovering new cafe stops.",
    contactEmailOrContactNote: "hello@mariaeatslocal.example.com",
    commercialHistoryNotes: "Mix of gifted brunch invites and a few paid local features.",
  },
  {
    sourceType: "DEMO",
    handle: "@fitwithkiana",
    displayName: "Fit With Kiana",
    platform: "TIKTOK",
    bio: "Practical fitness creator sharing gym confidence tips, simple home workouts, and healthy routines.",
    nicheTags: ["fitness", "wellness", "habits", "women's health"],
    targetRegion: "United States",
    creatorLocation: "Atlanta",
    followerCount: 32700,
    contentStyle: "Short-form training clips, voiceover tips, and realistic beginner fitness updates.",
    audienceNotes: "Women in their 20s and 30s who want fitness advice without intimidation.",
    contactEmailOrContactNote: "Manager contact available on request.",
    commercialHistoryNotes: "UGC, coaching app trials, and supplement test campaigns.",
  },
  {
    sourceType: "DEMO",
    handle: "@pawsandportraits",
    displayName: "Paws & Portraits",
    platform: "INSTAGRAM",
    bio: "Pet lifestyle creator featuring rescue dog routines, product reviews, and playful short videos.",
    nicheTags: ["pets", "lifestyle", "dog owners"],
    targetRegion: "Singapore",
    creatorLocation: "Singapore",
    followerCount: 22100,
    contentStyle: "Photo storytelling, casual reviews, and playful pet-focused reels.",
    audienceNotes: "Pet parents looking for useful products and joyful daily content.",
    contactEmailOrContactNote: "Instagram preferred",
    commercialHistoryNotes: "Mostly gifted pet product collaborations.",
  },
  {
    sourceType: "DEMO",
    handle: "@glowwithsana",
    displayName: "Glow With Sana",
    platform: "TIKTOK",
    bio: "Skincare educator who breaks down routines, ingredients, and before-and-after experiments.",
    nicheTags: ["skincare", "beauty", "education"],
    targetRegion: "Global English-speaking",
    creatorLocation: "Dubai",
    followerCount: 84200,
    contentStyle: "Ingredient explainers, comparison videos, and routine demos.",
    audienceNotes: "Beauty consumers comparing products and trying to build simple routines.",
    contactEmailOrContactNote: "team@glowwithsana.example.com",
    commercialHistoryNotes: "Paid skincare integrations and UGC licensing.",
  },
  {
    sourceType: "DEMO",
    handle: "@nomadnate",
    displayName: "Nomad Nate",
    platform: "YOUTUBE",
    bio: "Travel storyteller sharing city guides, hotel stays, and remote-work travel routines.",
    nicheTags: ["travel", "productivity", "remote work"],
    targetRegion: "Global",
    creatorLocation: "Lisbon",
    followerCount: 165000,
    contentStyle: "Long-form vlogs, city guides, and product integrations with practical use cases.",
    audienceNotes: "Remote workers, digital nomads, and experience-first travelers.",
    contactEmailOrContactNote: "contact@nomadnate.example.com",
    commercialHistoryNotes: "Mostly paid brand partnerships with travel and SaaS brands.",
  },
  {
    sourceType: "DEMO",
    handle: "@homebynoura",
    displayName: "Home By Noura",
    platform: "INSTAGRAM",
    bio: "Warm interiors creator sharing affordable home styling, renter-friendly updates, and hosting ideas.",
    nicheTags: ["home", "interiors", "lifestyle"],
    targetRegion: "Middle East and UK",
    creatorLocation: "Abu Dhabi",
    followerCount: 48300,
    contentStyle: "Calm reels, before-and-after styling, and aesthetic product roundups.",
    audienceNotes: "Young households interested in design on a realistic budget.",
    contactEmailOrContactNote: "Email in bio",
    commercialHistoryNotes: "Mix of paid homeware features and gifting.",
  },
  {
    sourceType: "DEMO",
    handle: "@cityweekendmia",
    displayName: "City Weekend Mia",
    platform: "INSTAGRAM",
    bio: "Lifestyle creator highlighting neighbourhood gems, event ideas, and weekend roundups.",
    nicheTags: ["local lifestyle", "city guides", "food"],
    targetRegion: "Miami",
    creatorLocation: "Miami",
    followerCount: 12900,
    contentStyle: "Friendly reels, roundups, and local venue spotlights.",
    audienceNotes: "Residents looking for easy local plans and new small business finds.",
    contactEmailOrContactNote: "DM or creator brief email",
    commercialHistoryNotes: "Mostly local venue invites and small paid posts.",
  },
  {
    sourceType: "DEMO",
    handle: "@padandplay",
    displayName: "Pad & Play",
    platform: "TIKTOK",
    bio: "Gaming creator balancing new releases, setup upgrades, and creator tools.",
    nicheTags: ["gaming", "tech", "creator tools"],
    targetRegion: "Global",
    creatorLocation: "Berlin",
    followerCount: 95800,
    contentStyle: "Fast reactions, product cutdowns, and gaming desk makeovers.",
    audienceNotes: "Young gaming audiences interested in creator gear and culture.",
    contactEmailOrContactNote: "team@padandplay.example.com",
    commercialHistoryNotes: "Paid launches and creator tool collaborations.",
  },
  {
    sourceType: "DEMO",
    handle: "@parentsafterfive",
    displayName: "Parents After Five",
    platform: "YOUTUBE",
    bio: "Parenting duo sharing family routines, honest product tests, and everyday household shortcuts.",
    nicheTags: ["parenting", "lifestyle", "home"],
    targetRegion: "United Kingdom",
    creatorLocation: "Manchester",
    followerCount: 60200,
    contentStyle: "Honest reviews, family day vlogs, and practical product demos.",
    audienceNotes: "Parents looking for realistic recommendations and calmer home routines.",
    contactEmailOrContactNote: "hello@parentsafterfive.example.com",
    commercialHistoryNotes: "Longer-term paid partnerships and family-focused UGC.",
  },
  {
    sourceType: "DEMO",
    handle: "@circuitandcoffee",
    displayName: "Circuit & Coffee",
    platform: "YOUTUBE",
    bio: "Tech creator mixing hardware reviews, productivity tools, and smart desk routines.",
    nicheTags: ["tech", "productivity", "creator economy"],
    targetRegion: "Global English-speaking",
    creatorLocation: "Vancouver",
    followerCount: 111000,
    contentStyle: "Explainer videos, desk setup showcases, and practical comparisons.",
    audienceNotes: "Knowledge workers and creators shopping for useful tools.",
    contactEmailOrContactNote: "Partnership email in channel description",
    commercialHistoryNotes: "Mostly paid integrations and affiliate partnerships.",
  },
  {
    sourceType: "DEMO",
    handle: "@yogawithlina",
    displayName: "Yoga With Lina",
    platform: "INSTAGRAM",
    bio: "Micro wellness creator sharing morning mobility, gentle routines, and nervous-system resets.",
    nicheTags: ["wellness", "yoga", "self care"],
    targetRegion: "Global",
    creatorLocation: "Cape Town",
    followerCount: 9100,
    contentStyle: "Calm reels, daily ritual content, and soft spoken guidance.",
    audienceNotes: "Women seeking gentle, realistic wellness habits and beginner routines.",
    contactEmailOrContactNote: "DM preferred",
    commercialHistoryNotes: "Mostly gifted wellness products and a few UGC packages.",
  },
  {
    sourceType: "DEMO",
    handle: "@platepassports",
    displayName: "Plate Passports",
    platform: "TIKTOK",
    bio: "Travel food creator blending quick city eats guides with affordable itineraries.",
    nicheTags: ["travel", "food", "city guides"],
    targetRegion: "Global",
    creatorLocation: "Barcelona",
    followerCount: 210000,
    contentStyle: "Quick food guides, cheap eats maps, and city challenge formats.",
    audienceNotes: "Experience-driven travelers and food-first trip planners.",
    contactEmailOrContactNote: "team@platepassports.example.com",
    commercialHistoryNotes: "Paid tourism partnerships and hospitality campaigns.",
  },
  {
    sourceType: "DEMO",
    handle: "@beautyactuallymei",
    displayName: "Beauty Actually Mei",
    platform: "INSTAGRAM",
    bio: "Beauty and skincare creator focused on realistic routines, ingredient notes, and texture-first reviews.",
    nicheTags: ["beauty", "skincare", "reviews"],
    targetRegion: "Australia",
    creatorLocation: "Melbourne",
    followerCount: 27400,
    contentStyle: "Honest mini reviews, skin updates, and routine breakdowns.",
    audienceNotes: "Beauty shoppers who like practical product guidance before buying.",
    contactEmailOrContactNote: "Email in bio",
    commercialHistoryNotes: "Mix of gifted and paid skincare work.",
  },
  {
    sourceType: "MANUAL",
    handle: "@coachsamcreates",
    displayName: "Coach Sam Creates",
    platform: "INSTAGRAM",
    bio: "Fitness coach creator sharing strength education, recovery tips, and client-style habit content.",
    nicheTags: ["fitness", "coaching", "ugc"],
    targetRegion: "Global",
    creatorLocation: "Leeds",
    followerCount: 14600,
    contentStyle: "Educational reels, talking-head explainers, and UGC style b-roll.",
    audienceNotes: "Adults looking for sustainable coaching and stronger routines.",
    contactEmailOrContactNote: "Added manually by demo workspace",
    commercialHistoryNotes: "UGC packages and lightweight app trials.",
  },
] as const;

const pipelineSeed = [
  {
    business: "harbor-cup",
    creator: "@mariaeatslocal",
    stage: "CONTACTED",
    statusNotes: "Menu tasting offered for the spring pastry launch.",
    proposedFeeNotes: "Gifted tasting plus a small local feature fee.",
    deliverablesNotes: "1 reel, 3 story frames, saveable cafe recommendation.",
    note: "Maria usually posts weekend cafe routes, so timing around Friday works best.",
    reminderTitle: "Follow up on tasting offer",
    reminderNote: "Send the updated spring menu photos before the weekend.",
    reminderOffsetDays: 2,
  },
  {
    business: "luma-skin",
    creator: "@glowwithsana",
    stage: "SHORTLISTED",
    statusNotes: "Strong routine-led fit for a launch bundle.",
    proposedFeeNotes: "Paid test campaign if usage rights stay simple.",
    deliverablesNotes: "1 TikTok routine demo and raw UGC cutdowns.",
    note: "Would be a strong fit if we keep the story around a simple morning routine.",
    reminderTitle: "Prep outreach brief",
    reminderNote: "Tighten the usage rights note before sending.",
    reminderOffsetDays: 3,
  },
  {
    business: "northline-coaching",
    creator: "@fitwithkiana",
    stage: "NEGOTIATING",
    statusNotes: "Creator likes the programme angle and wants a simple UGC package.",
    proposedFeeNotes: "UGC package plus affiliate code test.",
    deliverablesNotes: "3 short clips plus one talking-head testimonial.",
    note: "Kiana’s audience responds well to realistic routines over extreme transformations.",
    reminderTitle: "Review draft deliverables",
    reminderNote: "Confirm whether affiliate tracking is needed in v1.",
    reminderOffsetDays: 1,
  },
  {
    business: "luma-skin",
    creator: "@beautyactuallymei",
    stage: "READY_TO_CONTACT",
    statusNotes: "Good mid-sized creator for a simpler product-led pitch.",
    proposedFeeNotes: "Gifted-first or light paid test.",
    deliverablesNotes: "1 review carousel and optional routine story frames.",
    note: "A softer gifted opener is probably safer than leading with sponsorship language.",
    reminderTitle: "Personalise outreach",
    reminderNote: "Reference Mei’s recent gentle-routine post.",
    reminderOffsetDays: 4,
  },
] as const;

export async function resetAndSeedDemoData(prisma: PrismaClient) {
  await prisma.activity.deleteMany();
  await prisma.note.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.outreachDraft.deleteMany();
  await prisma.pipelineItem.deleteMany();
  await prisma.creatorMatch.deleteMany();
  await prisma.creator.deleteMany();
  await prisma.businessProfile.deleteMany();

  const createdBusinesses = new Map<string, { id: string; name: string }>();
  const createdCreators = new Map<string, { id: string; displayName: string }>();

  for (const business of businessProfiles) {
    const created = await prisma.businessProfile.create({
      data: business,
      select: {
        id: true,
        name: true,
      },
    });

    createdBusinesses.set(business.slug, created);
  }

  for (const creator of creators) {
    const created = await prisma.creator.create({
      data: {
        ...creator,
        nicheTags: [...creator.nicheTags],
        followerBand: followerBandFromCount(creator.followerCount),
      },
      select: {
        id: true,
        displayName: true,
      },
    });

    createdCreators.set(creator.handle, created);
  }

  const storedBusinesses = await prisma.businessProfile.findMany();
  const storedCreators = await prisma.creator.findMany();
  const matchMap = new Map<string, string>();

  for (const business of storedBusinesses) {
    for (const creator of storedCreators) {
      const match = scoreCreatorForBusiness(business, creator);
      const createdMatch = await prisma.creatorMatch.create({
        data: {
          businessProfileId: business.id,
          creatorId: creator.id,
          ...match,
        },
        select: {
          id: true,
        },
      });

      matchMap.set(`${business.id}:${creator.id}`, createdMatch.id);
    }
  }

  for (const entry of pipelineSeed) {
    const business = createdBusinesses.get(entry.business);
    const creator = createdCreators.get(entry.creator);

    if (!business || !creator) {
      continue;
    }

    const businessRecord = storedBusinesses.find((record) => record.id === business.id);
    const creatorRecord = storedCreators.find((record) => record.id === creator.id);

    if (!businessRecord || !creatorRecord) {
      continue;
    }

    const match = scoreCreatorForBusiness(businessRecord, creatorRecord);
    const pipelineItem = await prisma.pipelineItem.create({
      data: {
        businessProfileId: business.id,
        creatorId: creator.id,
        creatorMatchId: matchMap.get(`${business.id}:${creator.id}`),
        currentStage: entry.stage,
        recommendedCollaborationType: match.recommendedCollaborationType,
        latestOverallScore: match.overallScore,
        latestScoreSummary: match.mainReason,
        statusNotes: entry.statusNotes,
        proposedFeeNotes: entry.proposedFeeNotes,
        deliverablesNotes: entry.deliverablesNotes,
      },
      select: {
        id: true,
      },
    });

    await prisma.activity.createMany({
      data: [
        {
          pipelineItemId: pipelineItem.id,
          kind: "PIPELINE_CREATED",
          message: `${creatorRecord.displayName} was added to the pipeline.`,
        },
        {
          pipelineItemId: pipelineItem.id,
          kind: "STAGE_CHANGED",
          message: `Stage set to ${entry.stage.replaceAll("_", " ").toLowerCase()}.`,
        },
      ],
    });

    await prisma.note.create({
      data: {
        pipelineItemId: pipelineItem.id,
        body: entry.note,
      },
    });

    await prisma.activity.create({
      data: {
        pipelineItemId: pipelineItem.id,
        kind: "NOTE_ADDED",
        message: "Seed note added to the creator opportunity.",
      },
    });

    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + entry.reminderOffsetDays);
    reminderDate.setHours(9, 0, 0, 0);

    await prisma.reminder.create({
      data: {
        pipelineItemId: pipelineItem.id,
        title: entry.reminderTitle,
        note: entry.reminderNote,
        dueDate: reminderDate,
      },
    });

    await prisma.activity.create({
      data: {
        pipelineItemId: pipelineItem.id,
        kind: "REMINDER_CREATED",
        message: `Reminder added: ${entry.reminderTitle}.`,
      },
    });

    await prisma.outreachDraft.create({
      data: {
        businessProfileId: business.id,
        creatorId: creator.id,
        channel: "EMAIL",
        tone: businessRecord.brandToneDefault ?? "FRIENDLY",
        length: "MEDIUM",
        messageType:
          match.recommendedCollaborationType === "UGC_REQUEST"
            ? "UGC_REQUEST"
            : match.recommendedCollaborationType === "PAID_COLLAB"
              ? "PAID_COLLABORATION_PITCH"
              : "INITIAL_OUTREACH",
        subjectLine: `${businessRecord.name} x ${creatorRecord.displayName}`,
        body: `Hi ${creatorRecord.displayName},\n\nWe think there could be a strong fit between ${businessRecord.name} and your content.\n\nBest,\n${businessRecord.name}`,
      },
    });

    await prisma.activity.create({
      data: {
        pipelineItemId: pipelineItem.id,
        kind: "OUTREACH_SAVED",
        message: "A starter outreach draft is available for this opportunity.",
      },
    });
  }
}
