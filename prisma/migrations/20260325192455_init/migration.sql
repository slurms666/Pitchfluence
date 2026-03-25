-- CreateEnum
CREATE TYPE "CreatorSourceType" AS ENUM ('DEMO', 'MANUAL');

-- CreateEnum
CREATE TYPE "CreatorPlatform" AS ENUM ('INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'OTHER');

-- CreateEnum
CREATE TYPE "FollowerBand" AS ENUM ('NANO', 'MICRO', 'RISING', 'ESTABLISHED', 'LARGE');

-- CreateEnum
CREATE TYPE "CampaignGoal" AS ENUM ('BRAND_AWARENESS', 'SALES_CONVERSIONS', 'LOCAL_FOOTFALL', 'USER_GENERATED_CONTENT', 'AFFILIATE_TEST_CAMPAIGN');

-- CreateEnum
CREATE TYPE "SocialProofLevel" AS ENUM ('NONE_YET', 'SOME_CUSTOMER_TRACTION', 'GROWING_BRAND', 'ESTABLISHED_BRAND');

-- CreateEnum
CREATE TYPE "BrandTone" AS ENUM ('PROFESSIONAL', 'FRIENDLY', 'PERSUASIVE');

-- CreateEnum
CREATE TYPE "FitLevel" AS ENUM ('STRONG', 'POSSIBLE', 'LOW');

-- CreateEnum
CREATE TYPE "CollaborationType" AS ENUM ('PAID_COLLAB', 'GIFTED_COLLAB', 'AFFILIATE_COLLAB', 'UGC_REQUEST', 'LOCAL_AWARENESS_PLAY', 'NOT_RECOMMENDED_YET');

-- CreateEnum
CREATE TYPE "PipelineStage" AS ENUM ('NEW', 'SHORTLISTED', 'READY_TO_CONTACT', 'CONTACTED', 'REPLIED', 'NEGOTIATING', 'AGREED', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('OPEN', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ActivityKind" AS ENUM ('SYSTEM', 'PIPELINE_CREATED', 'STAGE_CHANGED', 'NOTE_ADDED', 'REMINDER_CREATED', 'REMINDER_COMPLETED', 'OUTREACH_SAVED', 'CUSTOM');

-- CreateEnum
CREATE TYPE "OutreachChannel" AS ENUM ('EMAIL', 'INSTAGRAM_DM', 'TIKTOK_DM');

-- CreateEnum
CREATE TYPE "OutreachLength" AS ENUM ('SHORT', 'MEDIUM');

-- CreateEnum
CREATE TYPE "OutreachMessageType" AS ENUM ('INITIAL_OUTREACH', 'FOLLOW_UP', 'GIFTED_COLLABORATION_PITCH', 'PAID_COLLABORATION_PITCH', 'UGC_REQUEST');

-- CreateTable
CREATE TABLE "BusinessProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "productOrServiceSummary" TEXT,
    "niche" TEXT,
    "targetAudience" TEXT,
    "targetRegion" TEXT,
    "budgetMin" INTEGER,
    "budgetMax" INTEGER,
    "campaignGoal" "CampaignGoal",
    "socialProofLevel" "SocialProofLevel",
    "socialProofNotes" TEXT,
    "offerNotes" TEXT,
    "brandToneDefault" "BrandTone" DEFAULT 'FRIENDLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Creator" (
    "id" TEXT NOT NULL,
    "sourceType" "CreatorSourceType" NOT NULL,
    "handle" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "platform" "CreatorPlatform" NOT NULL,
    "bio" TEXT,
    "nicheTags" TEXT[],
    "targetRegion" TEXT,
    "creatorLocation" TEXT,
    "followerCount" INTEGER,
    "followerBand" "FollowerBand",
    "contentStyle" TEXT,
    "audienceNotes" TEXT,
    "contactEmailOrContactNote" TEXT,
    "commercialHistoryNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Creator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorMatch" (
    "id" TEXT NOT NULL,
    "businessProfileId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "audienceFitScore" INTEGER NOT NULL,
    "audienceFitSummary" TEXT NOT NULL,
    "pitchViabilityScore" INTEGER NOT NULL,
    "pitchViabilitySummary" TEXT NOT NULL,
    "campaignFitScore" INTEGER NOT NULL,
    "campaignFitSummary" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "fitLevel" "FitLevel" NOT NULL,
    "recommendedCollaborationType" "CollaborationType" NOT NULL,
    "mainReason" TEXT NOT NULL,
    "softWarningMessage" TEXT,
    "riskFlags" TEXT[],
    "nextStepGuidance" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PipelineItem" (
    "id" TEXT NOT NULL,
    "businessProfileId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "creatorMatchId" TEXT,
    "currentStage" "PipelineStage" NOT NULL DEFAULT 'NEW',
    "recommendedCollaborationType" "CollaborationType",
    "latestOverallScore" INTEGER,
    "latestScoreSummary" TEXT,
    "statusNotes" TEXT,
    "proposedFeeNotes" TEXT,
    "agreedFeeNotes" TEXT,
    "deliverablesNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PipelineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutreachDraft" (
    "id" TEXT NOT NULL,
    "businessProfileId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "channel" "OutreachChannel" NOT NULL,
    "tone" "BrandTone" NOT NULL,
    "length" "OutreachLength" NOT NULL,
    "messageType" "OutreachMessageType" NOT NULL,
    "subjectLine" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutreachDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "pipelineItemId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "pipelineItemId" TEXT NOT NULL,
    "kind" "ActivityKind" NOT NULL DEFAULT 'SYSTEM',
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "pipelineItemId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "ReminderStatus" NOT NULL DEFAULT 'OPEN',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessProfile_name_idx" ON "BusinessProfile"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Creator_handle_key" ON "Creator"("handle");

-- CreateIndex
CREATE INDEX "Creator_sourceType_idx" ON "Creator"("sourceType");

-- CreateIndex
CREATE INDEX "Creator_platform_idx" ON "Creator"("platform");

-- CreateIndex
CREATE INDEX "CreatorMatch_businessProfileId_overallScore_idx" ON "CreatorMatch"("businessProfileId", "overallScore" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "CreatorMatch_businessProfileId_creatorId_key" ON "CreatorMatch"("businessProfileId", "creatorId");

-- CreateIndex
CREATE INDEX "PipelineItem_businessProfileId_currentStage_idx" ON "PipelineItem"("businessProfileId", "currentStage");

-- CreateIndex
CREATE UNIQUE INDEX "PipelineItem_businessProfileId_creatorId_key" ON "PipelineItem"("businessProfileId", "creatorId");

-- CreateIndex
CREATE INDEX "OutreachDraft_businessProfileId_createdAt_idx" ON "OutreachDraft"("businessProfileId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Note_pipelineItemId_createdAt_idx" ON "Note"("pipelineItemId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Activity_pipelineItemId_createdAt_idx" ON "Activity"("pipelineItemId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Reminder_pipelineItemId_status_dueDate_idx" ON "Reminder"("pipelineItemId", "status", "dueDate");

-- AddForeignKey
ALTER TABLE "CreatorMatch" ADD CONSTRAINT "CreatorMatch_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorMatch" ADD CONSTRAINT "CreatorMatch_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineItem" ADD CONSTRAINT "PipelineItem_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineItem" ADD CONSTRAINT "PipelineItem_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineItem" ADD CONSTRAINT "PipelineItem_creatorMatchId_fkey" FOREIGN KEY ("creatorMatchId") REFERENCES "CreatorMatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachDraft" ADD CONSTRAINT "OutreachDraft_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachDraft" ADD CONSTRAINT "OutreachDraft_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_pipelineItemId_fkey" FOREIGN KEY ("pipelineItemId") REFERENCES "PipelineItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_pipelineItemId_fkey" FOREIGN KEY ("pipelineItemId") REFERENCES "PipelineItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_pipelineItemId_fkey" FOREIGN KEY ("pipelineItemId") REFERENCES "PipelineItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
