import { pgTable, text, timestamp, boolean, integer, pgEnum } from "drizzle-orm/pg-core"

// these enums are community based.
// so full just means youll modify the entire community.
export const enumPermissions = pgEnum("user_permissions", [
    "full", "review", "tags", "ai"
])

export const communityPermissions = pgTable("community_permissions", {
    community_id: text("community_id"),
    permissions: enumPermissions("user_permissions").array().notNull().default([]),
});

// site_moderator means you modify EVERY community.

export const discordUsers = pgTable("discord_users", {
    id: text("id").primaryKey(),
    username: text("username"),
    avatar: text("avatar"),
    email: text("email"),
    created_at: timestamp("created_at").defaultNow(),

    // If they are trying to probe the security filter, autorejects EVERYTHING for manual review
    blacklisted: boolean("blacklisted").default(false),
    
    // moderates_communities: permissions,
    // TODO: this needs to be a relationship when returned via api
    site_moderator: boolean("site_moderator").default(false),
})

// its called communities but its the base of a community :plink:
export const communities = pgTable("communities", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    invite_link: text("invite_link"),
    tags: text("tags").array(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
    
    // atomic added these
    image_cover: text("image_cover"),
    image_ico
});

export const aiUsageEnum = pgEnum("ai_usage", ["none", "partial", "full"]);

// founder_id, so are we not having any teams?

// i wanted to leave that to you.
// how do you think I should manage that?

// VVVVVVVVVVV

// We should probably do teams, but also have a separate contributors part
// So you can have like 3 people who can upload new versions and then give credits in a seperate contributors part
// OR we have a list of people (authors) who can manage the package/mod and then contributors is like credits

//--------------
// uhhh.....
// i guess we can have a "group", then in that group we have "clowders", an array of user ids,
// and uh. i think thats it?

// ^^^^^^^^^^^^

export const mods = pgTable("mods", {
    community_id: text("community_id").notNull(),
    id: text("id").primaryKey(),                 // uuid or nanoid
    // this wont be changeable.
    // the name will. the slug will always point to the URL.
    slug: text("slug").notNull().unique(),        // url-safe name, e.g. "cakeday"
    name: text("name").notNull(),
    description: text("description"),
    readme: text("readme"),                       // longer markdown body for the mod page

    founder_id: text("founder_id").notNull().references(() => discordUsers.id),
    contributors: text("contributors").array(),        // array of user ids, e.g. ["123", "456"]

    category: text("category"),                   // or a categoryId ?
    tags: text("tags").array(),                   // Postgres native array, e.g. ["ui", "utility"]

    /**
     * Warning: **LYING ABOUT THIS WILL RESULT IN A TAKE-DOWN. CRY ABOUT IT.**
     * Atomic: Give them 1 warning :3
     * the awesome backend dev: maybe
     */
    ai_usage: aiUsageEnum("ai_usage").array().notNull().default([]),  // if the mod was created with AI assistance

    ai_disclosure: text("ai_disclosure"),  // if the mod was generated or assisted by AI, this is the disclosure text

    download_count: integer("download_count").default(0),
    is_approved: boolean("is_approved").default(false),  // moderation gate before public
    is_public: boolean("is_public").default(true),
    /**
     * if there is a ban reason; then it is banned; banned_reason is null, then not banned.
     */
    banned_reason: text("banned_reason"),    // if the mod is banned, it won't show up in public listings

    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
    
    // deprecation
    deprecated: boolean("deprecated").default(false).notNull(),
    deprecated_slug: text("deprecated_slug"),
    
    // not proper backend!!! yap yap yap
    // i tihnk its mad because I am referencing the object inside of itself.
    // but I dont klnow an alternative.
    // thats just basic multifile uploading, it just looks like your basic uh... .cert file.
    // yap. :murder: :plink:
    /**
     * ----------- DATA -----------
     * ....
     * ----------- DATA END -------
     */
});

export const modVersions = pgTable("mod_versions", {
    id: text("id").primaryKey(),
    mod_id: text("mod_id").notNull().references(() => mods.id),
    version: text("version").notNull(),           // semver string, e.g. "1.2.0"
    changelog: text("changelog"),
    file_url: text("file_url").notNull(),           // storage key/path, not raw bytes in db
    file_size: integer("file_size"),                // bytes
    sha256: text("sha256"),                        // integrity check on download
    //game_version: text("game_version"),             // which game/platform version it targets
    // I don't think game version is needed tbh
    created_at: timestamp("created_at").defaultNow(),
});

// right but do you want it as a text? or something else.

// 

export const modDependencies = pgTable("mod_dependencies", {
    id: text("id").primaryKey(),
    mod_version_id: text("mod_version_id").notNull().references(() => modVersions.id),
    depends_on_mod_id: text("depends_on_mod_id").notNull().references(() => mods.id),
    version_range: text("version_range"),   // e.g. "^1.2.0", ">=2.0.0", null = any version
    is_optional: boolean("is_optional").default(false),
})