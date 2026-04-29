CREATE TABLE "emotion_daily_checks" (
	"id" serial PRIMARY KEY NOT NULL,
	"check_id" text NOT NULL,
	"user_id" text NOT NULL,
	"check_date" date NOT NULL,
	"total_score" integer NOT NULL,
	"questions_json" jsonb NOT NULL,
	"is_below_threshold" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "emotion_daily_checks_check_id_unique" UNIQUE("check_id")
);
--> statement-breakpoint
CREATE TABLE "emotion_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"dimension" text NOT NULL,
	"question_text" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emotion_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"record_id" text NOT NULL,
	"user_id" text NOT NULL,
	"event" text NOT NULL,
	"emotion_type" text NOT NULL,
	"emotion_intensity" numeric(4, 2) NOT NULL,
	"need" text NOT NULL,
	"ai_recognized_emotion" text,
	"ai_recognized_intensity" numeric(4, 2),
	"record_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "emotion_records_record_id_unique" UNIQUE("record_id")
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"ai_provider" text DEFAULT 'zhipu' NOT NULL,
	"ai_model" text DEFAULT 'glm-4' NOT NULL,
	"ai_api_key" text,
	"emotion_threshold" integer DEFAULT 25 NOT NULL,
	"notification_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);
