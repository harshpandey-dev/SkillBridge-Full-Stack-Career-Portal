-- CreateTable
CREATE TABLE "recruiter_notification_preferences" (
    "id" TEXT NOT NULL,
    "recruiterId" TEXT NOT NULL,
    "newApplications" BOOLEAN NOT NULL DEFAULT true,
    "applicationUpdates" BOOLEAN NOT NULL DEFAULT true,
    "jobPerformanceUpdates" BOOLEAN NOT NULL DEFAULT true,
    "platformAnnouncements" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruiter_notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recruiter_notification_preferences_recruiterId_key" ON "recruiter_notification_preferences"("recruiterId");

-- AddForeignKey
ALTER TABLE "recruiter_notification_preferences" ADD CONSTRAINT "recruiter_notification_preferences_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "recruiter_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
