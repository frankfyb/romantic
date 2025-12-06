-- CreateTable
CREATE TABLE "ToolMetadata" (
    "id" TEXT NOT NULL,
    "toolKey" TEXT NOT NULL,
    "toolName" TEXT NOT NULL,
    "defaultConfig" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ToolMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToolConfig" (
    "id" TEXT NOT NULL,
    "toolKey" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "shareId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fingerprint" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ToolConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ToolMetadata_toolKey_key" ON "ToolMetadata"("toolKey");

-- CreateIndex
CREATE UNIQUE INDEX "ToolConfig_shareId_key" ON "ToolConfig"("shareId");

-- CreateIndex
CREATE INDEX "ToolConfig_toolKey_idx" ON "ToolConfig"("toolKey");
