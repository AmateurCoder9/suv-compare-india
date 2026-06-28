-- CreateTable
CREATE TABLE "Manufacturer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "logoUrl" TEXT,
    "websiteUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Model" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "manufacturerId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bodyType" TEXT NOT NULL,
    "launchYear" INTEGER NOT NULL,
    "currentYear" INTEGER NOT NULL,
    "generationName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Model_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ModelCompetitor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "modelId" INTEGER NOT NULL,
    "competitorId" INTEGER NOT NULL,
    CONSTRAINT "ModelCompetitor_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ModelCompetitor_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "Model" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Variant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "modelId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "isBase" BOOLEAN NOT NULL DEFAULT false,
    "isDiscontinued" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Variant_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Engine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "variantId" INTEGER NOT NULL,
    "displacement" INTEGER NOT NULL,
    "configType" TEXT NOT NULL,
    "fuelType" TEXT NOT NULL DEFAULT 'Petrol',
    "isTurbo" BOOLEAN NOT NULL DEFAULT false,
    "maxPowerBhp" REAL NOT NULL,
    "maxPowerRpm" INTEGER NOT NULL,
    "maxTorqueNm" REAL NOT NULL,
    "maxTorqueRpm" INTEGER NOT NULL,
    "emissionNorm" TEXT NOT NULL,
    "sourceId" INTEGER,
    "confidence" INTEGER NOT NULL DEFAULT 100,
    CONSTRAINT "Engine_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Engine_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transmission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "variantId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "speeds" INTEGER NOT NULL,
    "driveType" TEXT NOT NULL DEFAULT 'FWD',
    "sourceId" INTEGER,
    "confidence" INTEGER NOT NULL DEFAULT 100,
    CONSTRAINT "Transmission_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transmission_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Dimensions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "variantId" INTEGER NOT NULL,
    "lengthMm" INTEGER NOT NULL,
    "widthMm" INTEGER NOT NULL,
    "heightMm" INTEGER NOT NULL,
    "wheelbaseMm" INTEGER NOT NULL,
    "groundClearanceMm" INTEGER NOT NULL,
    "bootLitres" INTEGER NOT NULL,
    "fuelTankLitres" INTEGER NOT NULL,
    "kerbWeightKg" INTEGER,
    "tyreSizeFront" TEXT NOT NULL,
    "tyreSizeRear" TEXT NOT NULL,
    "sourceId" INTEGER,
    "confidence" INTEGER NOT NULL DEFAULT 100,
    CONSTRAINT "Dimensions_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Dimensions_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FuelEconomy" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "variantId" INTEGER NOT NULL,
    "araiKmpl" REAL NOT NULL,
    "realWorldEstKmpl" REAL,
    "testMethodology" TEXT NOT NULL DEFAULT 'ARAI',
    "sourceId" INTEGER,
    "confidence" INTEGER NOT NULL DEFAULT 90,
    "notes" TEXT,
    CONSTRAINT "FuelEconomy_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FuelEconomy_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FeatureCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isFilterable" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Feature_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FeatureCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VariantFeature" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "variantId" INTEGER NOT NULL,
    "featureId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "notes" TEXT,
    "sourceId" INTEGER,
    "confidence" INTEGER NOT NULL DEFAULT 100,
    CONSTRAINT "VariantFeature_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VariantFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VariantFeature_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SafetyFeature" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "variantId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isStandard" BOOLEAN NOT NULL DEFAULT true,
    "sourceId" INTEGER,
    "confidence" INTEGER NOT NULL DEFAULT 100,
    CONSTRAINT "SafetyFeature_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SafetyFeature_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ADASFeature" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "variantId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT,
    "notes" TEXT,
    "sourceId" INTEGER,
    "confidence" INTEGER NOT NULL DEFAULT 100,
    CONSTRAINT "ADASFeature_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ADASFeature_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScoreCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "weight" REAL NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "VariantScore" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "variantId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "score" REAL NOT NULL,
    "explanation" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL DEFAULT 80,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceIds" TEXT,
    CONSTRAINT "VariantScore_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VariantScore_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ScoreCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ownership" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "variantId" INTEGER NOT NULL,
    "warrantyYears" INTEGER NOT NULL,
    "warrantyKm" INTEGER NOT NULL,
    "extendedWarrantyAvail" BOOLEAN NOT NULL DEFAULT false,
    "insuranceEstInrLakh" REAL,
    "annualServiceCostInr" INTEGER,
    "tyreCostPerSetInr" INTEGER,
    "brakePadCostInr" INTEGER,
    "fiveYearOwnershipInr" INTEGER,
    "reliabilityNotes" TEXT,
    "resaleEstimatePercent" INTEGER,
    "sourceId" INTEGER,
    CONSTRAINT "Ownership_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ownership_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Warranty" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "variantId" INTEGER NOT NULL,
    "basicYears" INTEGER NOT NULL,
    "basicKm" INTEGER NOT NULL,
    "extYears" INTEGER,
    "extKm" INTEGER,
    "rustYears" INTEGER,
    "notes" TEXT,
    CONSTRAINT "Warranty_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommonIssue" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "variantId" INTEGER NOT NULL,
    "issue" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "resolution" TEXT,
    "sourceId" INTEGER,
    CONSTRAINT "CommonIssue_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CommonIssue_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Price" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "variantId" INTEGER NOT NULL,
    "priceInrLakh" REAL NOT NULL,
    "priceType" TEXT NOT NULL DEFAULT 'Ex-Showroom Delhi',
    "validFrom" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" DATETIME,
    "sourceId" INTEGER,
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Price_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Price_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pro" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "variantId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "Pro_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Con" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "variantId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "Con_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReviewConsensus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "variantId" INTEGER NOT NULL,
    "avgRating" REAL NOT NULL,
    "totalReviews" INTEGER NOT NULL,
    "commonPraise" TEXT NOT NULL,
    "commonComplaints" TEXT NOT NULL,
    "sources" TEXT NOT NULL,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReviewConsensus_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Media" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "variantId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT NOT NULL,
    "isOfficial" BOOLEAN NOT NULL DEFAULT true,
    "sourceId" INTEGER,
    CONSTRAINT "Media_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Media_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VariantProgression" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "beforeVariantId" INTEGER NOT NULL,
    "afterVariantId" INTEGER NOT NULL,
    "priceDiffInrLakh" REAL NOT NULL,
    "featuresAdded" TEXT NOT NULL,
    "featuresRemoved" TEXT,
    "verdict" TEXT NOT NULL,
    "verdictExplanation" TEXT NOT NULL,
    CONSTRAINT "VariantProgression_beforeVariantId_fkey" FOREIGN KEY ("beforeVariantId") REFERENCES "Variant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VariantProgression_afterVariantId_fkey" FOREIGN KEY ("afterVariantId") REFERENCES "Variant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ranking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "variantId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "score" REAL NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Ranking_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuyerGuide" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "criteria" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BuyerGuideEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guideId" INTEGER NOT NULL,
    "modelId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL,
    CONSTRAINT "BuyerGuideEntry_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "BuyerGuide" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BuyerGuideEntry_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comparison" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "variantAId" INTEGER NOT NULL,
    "variantBId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Comparison_variantAId_fkey" FOREIGN KEY ("variantAId") REFERENCES "Variant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comparison_variantBId_fkey" FOREIGN KEY ("variantBId") REFERENCES "Variant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Source" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "type" TEXT NOT NULL,
    "verifiedAt" DATETIME
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "table" TEXT NOT NULL,
    "recordId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "fieldName" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Manufacturer_name_key" ON "Manufacturer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Manufacturer_slug_key" ON "Manufacturer"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Model_slug_key" ON "Model"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_slug_key" ON "Variant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Engine_variantId_key" ON "Engine"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "Transmission_variantId_key" ON "Transmission"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "Dimensions_variantId_key" ON "Dimensions"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "FuelEconomy_variantId_key" ON "FuelEconomy"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureCategory_name_key" ON "FeatureCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureCategory_slug_key" ON "FeatureCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_slug_key" ON "Feature"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "VariantFeature_variantId_featureId_key" ON "VariantFeature"("variantId", "featureId");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreCategory_name_key" ON "ScoreCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreCategory_slug_key" ON "ScoreCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "VariantScore_variantId_categoryId_key" ON "VariantScore"("variantId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Ownership_variantId_key" ON "Ownership"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "Warranty_variantId_key" ON "Warranty"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewConsensus_variantId_key" ON "ReviewConsensus"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "VariantProgression_beforeVariantId_key" ON "VariantProgression"("beforeVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "VariantProgression_afterVariantId_key" ON "VariantProgression"("afterVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "Ranking_category_variantId_key" ON "Ranking"("category", "variantId");

-- CreateIndex
CREATE UNIQUE INDEX "BuyerGuide_slug_key" ON "BuyerGuide"("slug");
