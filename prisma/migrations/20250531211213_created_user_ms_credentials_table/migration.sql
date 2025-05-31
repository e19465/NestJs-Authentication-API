-- CreateTable
CREATE TABLE "UserMicrosoftCredential" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "idToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMicrosoftCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserMicrosoftCredential_userId_key" ON "UserMicrosoftCredential"("userId");

-- CreateIndex
CREATE INDEX "idx_user_microsoft_credential_user_id" ON "UserMicrosoftCredential"("userId");

-- CreateIndex
CREATE INDEX "idx_user_microsoft_credential_access_token" ON "UserMicrosoftCredential"("accessToken");

-- CreateIndex
CREATE INDEX "idx_user_microsoft_credential_refresh_token" ON "UserMicrosoftCredential"("refreshToken");

-- CreateIndex
CREATE INDEX "idx_user_microsoft_credential_id_token" ON "UserMicrosoftCredential"("idToken");

-- CreateIndex
CREATE UNIQUE INDEX "UserMicrosoftCredential_userId_accessToken_key" ON "UserMicrosoftCredential"("userId", "accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "UserMicrosoftCredential_userId_refreshToken_key" ON "UserMicrosoftCredential"("userId", "refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "UserMicrosoftCredential_userId_idToken_key" ON "UserMicrosoftCredential"("userId", "idToken");

-- AddForeignKey
ALTER TABLE "UserMicrosoftCredential" ADD CONSTRAINT "UserMicrosoftCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
