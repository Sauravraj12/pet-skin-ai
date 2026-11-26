CREATE TYPE "UserRole" AS ENUM ('OWNER', 'VETERINARIAN', 'ADMIN');
CREATE TYPE "ProviderStatus" AS ENUM ('SUCCESS', 'FAILED', 'UNCONFIGURED', 'VALIDATION_FAILED', 'DEMO');
CREATE TYPE "CaseStatus" AS ENUM ('NEW', 'SUBMITTED', 'UNDER_REVIEW', 'REVIEWED', 'EXAMINATION_RECOMMENDED', 'CLOSED');
CREATE TYPE "ReminderType" AS ENUM ('REPEAT_SCREENING', 'FOLLOW_UP', 'VETERINARY_REVIEW', 'REPORT_STATUS');
CREATE TYPE "NotificationType" AS ENUM ('FOLLOW_UP', 'REPEAT_SCREENING', 'REPORT_STATUS', 'VETERINARY_REVIEW', 'SYSTEM');
CREATE TYPE "ConsentType" AS ENUM ('IMAGE_PROCESSING', 'SCREENING_STORAGE', 'CONTACT', 'DATA_DELETION');

ALTER TABLE "Member" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'OWNER';
ALTER TABLE "Member" ADD COLUMN "passwordHash" TEXT;
ALTER TABLE "Member" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Member" ADD COLUMN "lastActiveAt" TIMESTAMP(3);
ALTER TABLE "Pet" ADD COLUMN "gender" TEXT;
ALTER TABLE "Pet" ADD COLUMN "profilePhotoUrl" TEXT;
ALTER TABLE "Pet" ADD COLUMN "deletedAt" TIMESTAMP(3);

ALTER TABLE "ScreeningSession" ADD COLUMN "storageProvider" TEXT;
ALTER TABLE "ScreeningSession" ADD COLUMN "storageKey" TEXT;
ALTER TABLE "ScreeningSession" ADD COLUMN "providerName" TEXT;
ALTER TABLE "ScreeningSession" ADD COLUMN "providerStatus" "ProviderStatus" NOT NULL DEFAULT 'UNCONFIGURED';
ALTER TABLE "ScreeningSession" ADD COLUMN "providerErrorCode" TEXT;
ALTER TABLE "ScreeningSession" ADD COLUMN "notes" TEXT;
ALTER TABLE "ScreeningSession" ADD COLUMN "status" "CaseStatus" NOT NULL DEFAULT 'NEW';
ALTER TABLE "ScreeningSession" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Product" ADD COLUMN "ingredients" TEXT;
ALTER TABLE "Product" ADD COLUMN "warnings" TEXT;
ALTER TABLE "Product" ADD COLUMN "usageInfo" TEXT;
ALTER TABLE "Product" ADD COLUMN "suitableSpecies" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "Product" ADD COLUMN "sponsored" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Product" ADD COLUMN "affiliate" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Product" ADD COLUMN "inStock" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Product" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Recommendation" ADD COLUMN "sponsorDisclosure" TEXT;
ALTER TABLE "Recommendation" ADD COLUMN "skipped" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "ScreeningImage" (
  "id" TEXT NOT NULL,
  "screeningSessionId" TEXT NOT NULL,
  "storageProvider" TEXT NOT NULL,
  "storageKey" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "byteSize" INTEGER NOT NULL,
  "sha256" TEXT,
  "retentionUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ScreeningImage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Clinic" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "licenseNumber" TEXT,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Clinic_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Veterinarian" (
  "id" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "clinicId" TEXT,
  "displayName" TEXT NOT NOT NULL,
  "licenseNumber" TEXT,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Veterinarian_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CaseReview" (
  "id" TEXT NOT NULL,
  "screeningSessionId" TEXT NOT NULL,
  "petId" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "veterinarianId" TEXT NOT NULL,
  "clinicId" TEXT,
  "status" "CaseStatus" NOT NULL DEFAULT 'SUBMITTED',
  "professionalComment" TEXT,
  "examinationRecommended" BOOLEAN NOT NULL DEFAULT false,
  "authorizedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CaseReview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FollowUpReminder" (
  "id" TEXT NOT NULL,
  "screeningSessionId" TEXT,
  "petId" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "type" "ReminderType" NOT NULL,
  "dueAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FollowUpReminder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "memberId" TEXT NOT NOT NULL,
  "screeningSessionId" TEXT,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "readAt" TIMESTAMP(3),
  "emailSentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ConsentRecord" (
  "id" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "type" "ConsentType" NOT NULL,
  "granted" BOOLEAN NOT NULL,
  "documentVersion" TEXT NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "memberId" TEXT,
  "actorRole" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "resourceType" TEXT NOT NULL,
  "resourceId" TEXT,
  "outcome" TEXT NOT NULL,
  "metadata" JSONB,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Veterinarian_memberId_key" ON "Veterinarian"("memberId");
CREATE UNIQUE INDEX "CaseReview_screeningSessionId_veterinarianId_key" ON "CaseReview"("screeningSessionId", "veterinarianId");
CREATE INDEX "ScreeningImage_screeningSessionId_idx" ON "ScreeningImage"("screeningSessionId");
CREATE INDEX "ScreeningImage_retentionUntil_idx" ON "ScreeningImage"("retentionUntil");
CREATE INDEX "CaseReview_ownerId_status_idx" ON "CaseReview"("ownerId", "status");
CREATE INDEX "CaseReview_veterinarianId_status_idx" ON "CaseReview"("veterinarianId", "status");
CREATE INDEX "FollowUpReminder_ownerId_dueAt_idx" ON "FollowUpReminder"("ownerId", "dueAt");
CREATE INDEX "FollowUpReminder_petId_dueAt_idx" ON "FollowUpReminder"("petId", "dueAt");
CREATE INDEX "Notification_memberId_readAt_idx" ON "Notification"("memberId", "readAt");
CREATE INDEX "ConsentRecord_memberId_type_idx" ON "ConsentRecord"("memberId", "type");
CREATE INDEX "AuditLog_memberId_createdAt_idx" ON "AuditLog"("memberId", "createdAt");
CREATE INDEX "AuditLog_resourceType_resourceId_idx" ON "AuditLog"("resourceType", "resourceId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

ALTER TABLE "ScreeningImage" ADD CONSTRAINT "ScreeningImage_screeningSessionId_fkey" FOREIGN KEY ("screeningSessionId") REFERENCES "ScreeningSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Veterinarian" ADD CONSTRAINT "Veterinarian_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CaseReview" ADD CONSTRAINT "CaseReview_screeningSessionId_fkey" FOREIGN KEY ("screeningSessionId") REFERENCES "ScreeningSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CaseReview" ADD CONSTRAINT "CaseReview_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CaseReview" ADD CONSTRAINT "CaseReview_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CaseReview" ADD CONSTRAINT "CaseReview_veterinarianId_fkey" FOREIGN KEY ("veterinarianId") REFERENCES "Veterinarian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CaseReview" ADD CONSTRAINT "CaseReview_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FollowUpReminder" ADD CONSTRAINT "FollowUpReminder_screeningSessionId_fkey" FOREIGN KEY ("screeningSessionId") REFERENCES "ScreeningSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FollowUpReminder" ADD CONSTRAINT "FollowUpReminder_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_screeningSessionId_fkey" FOREIGN KEY ("screeningSessionId") REFERENCES "ScreeningSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
