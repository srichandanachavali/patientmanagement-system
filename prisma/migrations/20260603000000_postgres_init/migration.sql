-- Baseline migration for VEDA Dental PMS — PostgreSQL
-- Generated from prisma/schema.prisma for Neon / Vercel Postgres

-- CreateTable: User
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Patient
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "dob" TIMESTAMP(3),
    "gender" TEXT,
    "address" TEXT,
    "abhaNumber" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "emergencyContact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable: MedicalHistory
CREATE TABLE "MedicalHistory" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "conditions" TEXT NOT NULL DEFAULT '[]',
    "medications" TEXT NOT NULL DEFAULT '[]',
    "allergies" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT,
    CONSTRAINT "MedicalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Consent
CREATE TABLE "Consent" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawnAt" TIMESTAMP(3),
    CONSTRAINT "Consent_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Appointment
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "dentistId" TEXT NOT NULL,
    "chair" INTEGER NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BOOKED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable: TreatmentPlan
CREATE TABLE "TreatmentPlan" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROPOSED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TreatmentPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Invoice (must precede InvoiceLine)
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable: InvoiceLine (must precede Procedure for the billedLineId FK)
CREATE TABLE "InvoiceLine" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 18,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InvoiceLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Procedure (references TreatmentPlan + InvoiceLine)
CREATE TABLE "Procedure" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "toothFdi" INTEGER,
    "code" TEXT,
    "description" TEXT NOT NULL,
    "costEstimate" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROPOSED',
    "phase" INTEGER NOT NULL DEFAULT 1,
    "completedAt" TIMESTAMP(3),
    "billedLineId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Procedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ToothRecord
CREATE TABLE "ToothRecord" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "toothFdi" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "surface" TEXT,
    "findings" TEXT NOT NULL DEFAULT '[]',
    "notedById" TEXT,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ToothRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ClinicalNote
CREATE TABLE "ClinicalNote" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClinicalNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Attachment
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'OTHER',
    "uploadedById" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Payment
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "mode" TEXT NOT NULL,
    "reference" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedById" TEXT NOT NULL,
    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Prescription
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "prescribedById" TEXT NOT NULL,
    "items" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable: LabCase
CREATE TABLE "LabCase" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "caseType" TEXT NOT NULL DEFAULT 'Other',
    "toothNumbers" TEXT,
    "material" TEXT,
    "shade" TEXT,
    "labName" TEXT,
    "dentistNotes" TEXT,
    "labAssistantNotes" TEXT,
    "cost" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'Planned',
    "sentAt" TIMESTAMP(3),
    "expectedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LabCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AuditLog
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ClinicSettings (singleton — id always = 1)
CREATE TABLE "ClinicSettings" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "gstRate" DOUBLE PRECISION NOT NULL DEFAULT 18,
    "chairCount" INTEGER NOT NULL DEFAULT 3,
    "hoursJson" TEXT NOT NULL,
    "brandColor" TEXT NOT NULL DEFAULT '#0d9488',
    "upiVpa" TEXT NOT NULL DEFAULT 'vedadental@upi',
    "upiPayeeName" TEXT NOT NULL DEFAULT 'VEDA Super Speciality Dental Clinic',
    CONSTRAINT "ClinicSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PatientChecklist
CREATE TABLE "PatientChecklist" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "drugAllergiesConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "consentRecorded" BOOLEAN NOT NULL DEFAULT false,
    "chiefComplaintNoted" BOOLEAN NOT NULL DEFAULT false,
    "medicalHistoryReviewed" BOOLEAN NOT NULL DEFAULT false,
    "bpStatus" TEXT,
    "diabeticStatus" TEXT,
    "bleedingDisorder" BOOLEAN NOT NULL DEFAULT false,
    "pregnancyStatus" TEXT,
    "currentMedications" TEXT,
    "dentalHistoryReviewed" BOOLEAN NOT NULL DEFAULT false,
    "tobaccoHabit" TEXT,
    "lastXrayDate" TIMESTAMP(3),
    "lastXrayType" TEXT,
    "readyForTreatment" BOOLEAN NOT NULL DEFAULT false,
    "lastReviewedAt" TIMESTAMP(3),
    "lastReviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PatientChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable: FollowUp
CREATE TABLE "FollowUp" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "treatmentPlanId" TEXT,
    "reason" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PatientFeedback
CREATE TABLE "PatientFeedback" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "rating" INTEGER NOT NULL,
    "treatmentRating" INTEGER,
    "staffRating" INTEGER,
    "waitTimeRating" INTEGER,
    "cleanlinessRating" INTEGER,
    "valueRating" INTEGER,
    "comment" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PatientFeedback_pkey" PRIMARY KEY ("id")
);

-- ────────────────────────────────────────────────────────────────────────────────
-- Unique indexes
-- ────────────────────────────────────────────────────────────────────────────────

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Patient_abhaNumber_key" ON "Patient"("abhaNumber");
CREATE UNIQUE INDEX "MedicalHistory_patientId_key" ON "MedicalHistory"("patientId");
CREATE UNIQUE INDEX "ToothRecord_patientId_toothFdi_createdAt_key" ON "ToothRecord"("patientId", "toothFdi", "createdAt");
CREATE UNIQUE INDEX "Procedure_billedLineId_key" ON "Procedure"("billedLineId");
CREATE UNIQUE INDEX "PatientChecklist_patientId_key" ON "PatientChecklist"("patientId");

-- ────────────────────────────────────────────────────────────────────────────────
-- Regular indexes
-- ────────────────────────────────────────────────────────────────────────────────

CREATE INDEX "Patient_phone_idx" ON "Patient"("phone");
CREATE INDEX "Patient_name_idx" ON "Patient"("name");
CREATE INDEX "Consent_patientId_idx" ON "Consent"("patientId");
CREATE INDEX "ToothRecord_patientId_toothFdi_idx" ON "ToothRecord"("patientId", "toothFdi");
CREATE INDEX "Appointment_start_idx" ON "Appointment"("start");
CREATE INDEX "Appointment_dentistId_start_idx" ON "Appointment"("dentistId", "start");
CREATE INDEX "Appointment_chair_start_idx" ON "Appointment"("chair", "start");
CREATE INDEX "TreatmentPlan_patientId_idx" ON "TreatmentPlan"("patientId");
CREATE INDEX "Procedure_planId_idx" ON "Procedure"("planId");
CREATE INDEX "ClinicalNote_patientId_idx" ON "ClinicalNote"("patientId");
CREATE INDEX "Attachment_patientId_idx" ON "Attachment"("patientId");
CREATE INDEX "Invoice_patientId_idx" ON "Invoice"("patientId");
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");
CREATE INDEX "InvoiceLine_invoiceId_idx" ON "InvoiceLine"("invoiceId");
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");
CREATE INDEX "Prescription_patientId_idx" ON "Prescription"("patientId");
CREATE INDEX "LabCase_patientId_idx" ON "LabCase"("patientId");
CREATE INDEX "LabCase_status_idx" ON "LabCase"("status");
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");
CREATE INDEX "FollowUp_patientId_idx" ON "FollowUp"("patientId");
CREATE INDEX "FollowUp_scheduledDate_idx" ON "FollowUp"("scheduledDate");
CREATE INDEX "FollowUp_status_idx" ON "FollowUp"("status");
CREATE INDEX "PatientFeedback_patientId_idx" ON "PatientFeedback"("patientId");
CREATE INDEX "PatientFeedback_submittedAt_idx" ON "PatientFeedback"("submittedAt");

-- ────────────────────────────────────────────────────────────────────────────────
-- Foreign-key constraints
-- ────────────────────────────────────────────────────────────────────────────────

ALTER TABLE "MedicalHistory"
    ADD CONSTRAINT "MedicalHistory_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Consent"
    ADD CONSTRAINT "Consent_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ToothRecord"
    ADD CONSTRAINT "ToothRecord_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ToothRecord"
    ADD CONSTRAINT "ToothRecord_notedById_fkey"
    FOREIGN KEY ("notedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Appointment"
    ADD CONSTRAINT "Appointment_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Appointment"
    ADD CONSTRAINT "Appointment_dentistId_fkey"
    FOREIGN KEY ("dentistId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TreatmentPlan"
    ADD CONSTRAINT "TreatmentPlan_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Invoice"
    ADD CONSTRAINT "Invoice_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Invoice"
    ADD CONSTRAINT "Invoice_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InvoiceLine"
    ADD CONSTRAINT "InvoiceLine_invoiceId_fkey"
    FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Procedure"
    ADD CONSTRAINT "Procedure_planId_fkey"
    FOREIGN KEY ("planId") REFERENCES "TreatmentPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Procedure"
    ADD CONSTRAINT "Procedure_billedLineId_fkey"
    FOREIGN KEY ("billedLineId") REFERENCES "InvoiceLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ClinicalNote"
    ADD CONSTRAINT "ClinicalNote_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClinicalNote"
    ADD CONSTRAINT "ClinicalNote_appointmentId_fkey"
    FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ClinicalNote"
    ADD CONSTRAINT "ClinicalNote_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Attachment"
    ADD CONSTRAINT "Attachment_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Attachment"
    ADD CONSTRAINT "Attachment_uploadedById_fkey"
    FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Payment"
    ADD CONSTRAINT "Payment_invoiceId_fkey"
    FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Payment"
    ADD CONSTRAINT "Payment_recordedById_fkey"
    FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Prescription"
    ADD CONSTRAINT "Prescription_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Prescription"
    ADD CONSTRAINT "Prescription_appointmentId_fkey"
    FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Prescription"
    ADD CONSTRAINT "Prescription_prescribedById_fkey"
    FOREIGN KEY ("prescribedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "LabCase"
    ADD CONSTRAINT "LabCase_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LabCase"
    ADD CONSTRAINT "LabCase_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AuditLog"
    ADD CONSTRAINT "AuditLog_actorId_fkey"
    FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PatientChecklist"
    ADD CONSTRAINT "PatientChecklist_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FollowUp"
    ADD CONSTRAINT "FollowUp_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FollowUp"
    ADD CONSTRAINT "FollowUp_treatmentPlanId_fkey"
    FOREIGN KEY ("treatmentPlanId") REFERENCES "TreatmentPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PatientFeedback"
    ADD CONSTRAINT "PatientFeedback_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PatientFeedback"
    ADD CONSTRAINT "PatientFeedback_appointmentId_fkey"
    FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
