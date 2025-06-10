-- CreateTable
CREATE TABLE "UserMicrosoftOutlookCredential" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "idToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMicrosoftOutlookCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserMicrosoftOutlookCredential_email_key" ON "UserMicrosoftOutlookCredential"("email");

-- CreateIndex
CREATE INDEX "idx_user_microsoft_outlook_credential_email" ON "UserMicrosoftOutlookCredential"("email");
