CREATE TYPE "public"."status" AS ENUM('dikirim', 'psikotes', 'wawancara', 'diterima', 'ditolak');--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company" text NOT NULL,
	"position" text NOT NULL,
	"job_url" text,
	"applied_at" date NOT NULL,
	"reminder_at" timestamp with time zone,
	"status" "status" DEFAULT 'dikirim' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "applications_status_idx" ON "applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "applications_applied_at_idx" ON "applications" USING btree ("applied_at");