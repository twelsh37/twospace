CREATE TYPE "public"."asset_state" AS ENUM('AVAILABLE', 'SIGNED_OUT', 'BUILDING', 'READY_TO_GO', 'ISSUED', 'holding');--> statement-breakpoint
CREATE TYPE "public"."asset_status" AS ENUM('holding', 'active', 'recycled', 'stock');--> statement-breakpoint
CREATE TYPE "public"."asset_type" AS ENUM('MOBILE_PHONE', 'TABLET', 'DESKTOP', 'LAPTOP', 'MONITOR');--> statement-breakpoint
CREATE TYPE "public"."assignment_type" AS ENUM('INDIVIDUAL', 'SHARED');--> statement-breakpoint
CREATE TYPE "public"."holding_asset_status" AS ENUM('pending', 'processed', 'error');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'USER');--> statement-breakpoint
CREATE TABLE "archived_assets" (
	"id" uuid PRIMARY KEY NOT NULL,
	"asset_number" varchar(10),
	"type" "asset_type" NOT NULL,
	"state" "asset_state" NOT NULL,
	"serial_number" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"purchase_price" numeric(10, 2) NOT NULL,
	"location_id" uuid NOT NULL,
	"assignment_type" "assignment_type" NOT NULL,
	"assigned_to" varchar(255),
	"employee_id" varchar(50),
	"department" varchar(255),
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"status" "asset_status" NOT NULL,
	"archived_at" timestamp with time zone DEFAULT now(),
	"archived_by" uuid NOT NULL,
	"archive_reason" text
);
--> statement-breakpoint
CREATE TABLE "asset_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid NOT NULL,
	"user_id" uuid,
	"location_id" uuid,
	"assignment_type" "assignment_type" NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now(),
	"assigned_by" uuid NOT NULL,
	"unassigned_at" timestamp with time zone,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "asset_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid NOT NULL,
	"previous_state" "asset_state",
	"new_state" "asset_state" NOT NULL,
	"changed_by" uuid NOT NULL,
	"change_reason" text,
	"timestamp" timestamp with time zone DEFAULT now(),
	"details" jsonb
);
--> statement-breakpoint
CREATE TABLE "asset_sequences" (
	"asset_type" "asset_type" PRIMARY KEY NOT NULL,
	"next_sequence" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_number" varchar(10),
	"type" "asset_type" NOT NULL,
	"state" "asset_state" DEFAULT 'AVAILABLE' NOT NULL,
	"serial_number" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"purchase_price" numeric(10, 2) NOT NULL,
	"location_id" uuid NOT NULL,
	"assignment_type" "assignment_type" DEFAULT 'INDIVIDUAL' NOT NULL,
	"assigned_to" varchar(255),
	"employee_id" varchar(50),
	"department" varchar(255),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"status" "asset_status" DEFAULT 'holding' NOT NULL,
	CONSTRAINT "assets_asset_number_unique" UNIQUE("asset_number"),
	CONSTRAINT "assets_serial_number_unique" UNIQUE("serial_number")
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"location_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "holding_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"serial_number" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"supplier" varchar(255),
	"imported_by" uuid,
	"imported_at" timestamp with time zone DEFAULT now(),
	"status" "holding_asset_status" DEFAULT 'pending' NOT NULL,
	"raw_data" jsonb,
	"notes" text,
	CONSTRAINT "holding_assets_serial_number_unique" UNIQUE("serial_number")
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "locations_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" integer PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"role" varchar(32) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_cache_duration" integer DEFAULT 30 NOT NULL,
	"depreciation_settings" jsonb,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"employee_id" varchar(50) NOT NULL,
	"location_id" uuid NOT NULL,
	"department_id" uuid NOT NULL,
	"role" "user_role" DEFAULT 'USER' NOT NULL,
	"password_hash" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
ALTER TABLE "archived_assets" ADD CONSTRAINT "archived_assets_archived_by_users_id_fk" FOREIGN KEY ("archived_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_assignments" ADD CONSTRAINT "asset_assignments_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_assignments" ADD CONSTRAINT "asset_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_assignments" ADD CONSTRAINT "asset_assignments_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_assignments" ADD CONSTRAINT "asset_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_history" ADD CONSTRAINT "asset_history_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_history" ADD CONSTRAINT "asset_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holding_assets" ADD CONSTRAINT "holding_assets_imported_by_users_id_fk" FOREIGN KEY ("imported_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;