import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("reader"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  token: varchar("token", { length: 128 }).primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
});

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  data: text("data").notNull(), // base64
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const novels = pgTable(
  "novels",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 200 }).notNull().unique(),
    title: varchar("title", { length: 200 }).notNull(),
    author: varchar("author", { length: 120 }).notNull(),
    genre: varchar("genre", { length: 60 }).notNull(),
    description: text("description").notNull(),
    coverUrl: text("cover_url"),
    published: boolean("published").notNull().default(false),
    featured: boolean("featured").notNull().default(false),
    views: integer("views").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    publishedAt: timestamp("published_at"),
  },
  (t) => [index("novels_genre_idx").on(t.genre)],
);

export const chapters = pgTable(
  "chapters",
  {
    id: serial("id").primaryKey(),
    novelId: integer("novel_id")
      .notNull()
      .references(() => novels.id, { onDelete: "cascade" }),
    number: integer("number").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("chapters_novel_number_idx").on(t.novelId, t.number)],
);

// kind: "bookmark" | "favorite"
export const libraryEntries = pgTable(
  "library_entries",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    novelId: integer("novel_id")
      .notNull()
      .references(() => novels.id, { onDelete: "cascade" }),
    kind: varchar("kind", { length: 20 }).notNull(),
    chapterNumber: integer("chapter_number"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("library_unique_idx").on(t.userId, t.novelId, t.kind)],
);

export const readingProgress = pgTable(
  "reading_progress",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    novelId: integer("novel_id")
      .notNull()
      .references(() => novels.id, { onDelete: "cascade" }),
    chapterNumber: integer("chapter_number").notNull(),
    percent: integer("percent").notNull().default(0),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("progress_unique_idx").on(t.userId, t.novelId)],
);

export type User = typeof users.$inferSelect;
export type Novel = typeof novels.$inferSelect;
export type Chapter = typeof chapters.$inferSelect;

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 200 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
