import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core"

export const discordUsers = pgTable("discord_users", {
    id: text("id").primaryKey(),
    username: text("username"),
    avatar: text("avatar"),
    email: text("email"),
    createdAt: timestamp("createdAt").defaultNow(),
})

export const mods = pgTable("mods", {
    id: text("id").primaryKey(),                 // uuid or nanoid
    slug: text("slug").notNull().unique(),        // url-safe name, e.g. "cakeday"
    name: text("name").notNull(),
    description: text("description"),
    readme: text("readme"),                       // longer markdown body for the mod page

    ownerId: text("owner_id").notNull().references(() => discordUsers.id),

    category: text("category"),                   // or a categoryId FK if you want structured categories
    tags: text("tags").array(),                   // Postgres native array, e.g. ["ui", "utility"]

    downloadCount: integer("download_count").default(0),
    isApproved: boolean("is_approved").default(false),  // moderation gate before public
    isPublic: boolean("is_public").default(true),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const modVersions = pgTable("mod_versions", {
    id: text("id").primaryKey(),
    modId: text("mod_id").notNull().references(() => mods.id),
    version: text("version").notNull(),           // semver string, e.g. "1.2.0"
    changelog: text("changelog"),
    fileUrl: text("file_url").notNull(),           // storage key/path, not raw bytes in db
    fileSize: integer("file_size"),                // bytes
    sha256: text("sha256"),                        // integrity check on download
    gameVersion: text("game_version"),             // which game/platform version it targets
    createdAt: timestamp("created_at").defaultNow(),
});

export const modDependencies = pgTable("mod_dependencies", {
    id: text("id").primaryKey(),
    modVersionId: text("mod_version_id").notNull().references(() => modVersions.id),
    dependsOnModId: text("depends_on_mod_id").notNull().references(() => mods.id),
    versionRange: text("version_range"),   // e.g. "^1.2.0", ">=2.0.0", null = any version
    isOptional: boolean("is_optional").default(false),
});