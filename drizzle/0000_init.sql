CREATE TABLE "entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"category" text NOT NULL,
	"label" text,
	"amount_cents" integer NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "entries_amount_positive" CHECK ("entries"."amount_cents" > 0 and "entries"."amount_cents" <= 100000),
	CONSTRAINT "entries_label_length" CHECK ("entries"."label" is null or char_length("entries"."label") <= 40)
);
--> statement-breakpoint
CREATE INDEX "entries_user_occurred_idx" ON "entries" USING btree ("user_id","occurred_at" DESC NULLS LAST) WHERE "entries"."deleted_at" is null;