CREATE TABLE "notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"note_id" text NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"tags" jsonb NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "notes_note_id_unique" UNIQUE("note_id")
);
--> statement-breakpoint
COMMENT ON TABLE "notes" IS '用户知识笔记表';
--> statement-breakpoint
COMMENT ON COLUMN "notes"."id" IS '内部自增主键';
--> statement-breakpoint
COMMENT ON COLUMN "notes"."note_id" IS '外部暴露的笔记UUID';
--> statement-breakpoint
COMMENT ON COLUMN "notes"."user_id" IS '关联用户ID';
--> statement-breakpoint
COMMENT ON COLUMN "notes"."title" IS '笔记标题';
--> statement-breakpoint
COMMENT ON COLUMN "notes"."content" IS '笔记内容';
--> statement-breakpoint
COMMENT ON COLUMN "notes"."tags" IS '标签JSON数组';
--> statement-breakpoint
COMMENT ON COLUMN "notes"."is_pinned" IS '是否置顶';
--> statement-breakpoint
COMMENT ON COLUMN "notes"."created_at" IS '创建时间（UTC）';
--> statement-breakpoint
COMMENT ON COLUMN "notes"."updated_at" IS '最后更新时间（UTC）';
--> statement-breakpoint
COMMENT ON COLUMN "notes"."deleted_at" IS '软删除时间（UTC）';
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"quadrant" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" date NOT NULL,
	"completed_at" date,
	"linked_note_id" text,
	"created_at_ts" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "tasks_task_id_unique" UNIQUE("task_id")
);
--> statement-breakpoint
COMMENT ON TABLE "tasks" IS '用户任务表';
--> statement-breakpoint
COMMENT ON COLUMN "tasks"."id" IS '内部自增主键';
--> statement-breakpoint
COMMENT ON COLUMN "tasks"."task_id" IS '外部暴露的任务UUID';
--> statement-breakpoint
COMMENT ON COLUMN "tasks"."user_id" IS '关联用户ID';
--> statement-breakpoint
COMMENT ON COLUMN "tasks"."title" IS '任务标题';
--> statement-breakpoint
COMMENT ON COLUMN "tasks"."description" IS '任务描述（可选）';
--> statement-breakpoint
COMMENT ON COLUMN "tasks"."quadrant" IS '优先级象限：重要紧急/重要不紧急/紧急不重要/不重要不紧急';
--> statement-breakpoint
COMMENT ON COLUMN "tasks"."completed" IS '是否完成';
--> statement-breakpoint
COMMENT ON COLUMN "tasks"."created_at" IS '创建日期';
--> statement-breakpoint
COMMENT ON COLUMN "tasks"."completed_at" IS '完成日期（可选）';
--> statement-breakpoint
COMMENT ON COLUMN "tasks"."linked_note_id" IS '关联笔记ID（可选）';
--> statement-breakpoint
COMMENT ON COLUMN "tasks"."created_at_ts" IS '创建时间戳（UTC）';
--> statement-breakpoint
COMMENT ON COLUMN "tasks"."updated_at" IS '最后更新时间（UTC）';
--> statement-breakpoint
COMMENT ON COLUMN "tasks"."deleted_at" IS '软删除时间（UTC）';
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
COMMENT ON TABLE "users" IS '系统用户信息表';
--> statement-breakpoint
COMMENT ON COLUMN "users"."id" IS '内部自增主键';
--> statement-breakpoint
COMMENT ON COLUMN "users"."user_id" IS '外部暴露的用户UUID，防止ID被遍历';
--> statement-breakpoint
COMMENT ON COLUMN "users"."email" IS '用户邮箱，唯一标识';
--> statement-breakpoint
COMMENT ON COLUMN "users"."password_hash" IS '密码哈希值（bcryptjs）';
--> statement-breakpoint
COMMENT ON COLUMN "users"."name" IS '用户昵称/姓名';
--> statement-breakpoint
COMMENT ON COLUMN "users"."is_admin" IS '是否为管理员';
--> statement-breakpoint
COMMENT ON COLUMN "users"."is_active" IS '账号是否启用';
--> statement-breakpoint
COMMENT ON COLUMN "users"."created_at" IS '创建时间（UTC）';
--> statement-breakpoint
COMMENT ON COLUMN "users"."updated_at" IS '最后更新时间（UTC）';
--> statement-breakpoint
COMMENT ON COLUMN "users"."deleted_at" IS '软删除时间（UTC）';
