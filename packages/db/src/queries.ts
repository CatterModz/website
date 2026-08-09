// packages/db/src/queries.ts
import { eq, desc } from "drizzle-orm";
import { db } from "../index.ts";
import { discordUsers, mods, modVersions, modDependencies } from "./schema";
import {getCookie} from "hono/cookie";

export async function getUserById(id: string) {
    const [user] = await db.select().from(discordUsers).where(eq(discordUsers.id, id));
    return user ?? null;
}

export async function upsertDiscordUser(discordUser: {
    id: string;
    username: string;
    avatar?: string;
    email?: string;
}) {
    const [user] = await db
        .insert(discordUsers)
        .values(discordUser)
        .onConflictDoUpdate({
            target: discordUsers.id,
            set: { username: discordUser.username, avatar: discordUser.avatar },
        })
        .returning();
    return user;
}

export async function getModById(id: string) {
    const [mod] = await db.select().from(mods).where(eq(mods.id, id));
    return mod ?? null;
}

export async function getModBySlug(slug: string) {
    const [mod] = await db.select().from(mods).where(eq(mods.slug, slug));
    return mod ?? null;
}

export async function getModsByOwner(ownerId: string) {
    return db.select().from(mods).where(eq(mods.ownerId, ownerId));
}

export async function listPublicMods(limit = 50) {
    return db
        .select()
        .from(mods)
        .where(eq(mods.isPublic, true))
        .orderBy(desc(mods.createdAt))
        .limit(limit);
}

export async function createMod(data: typeof mods.$inferInsert) {
    const [mod] = await db.insert(mods).values(data).returning();
    return mod;
}

export async function getModVersions(modId: string) {
    return db
        .select()
        .from(modVersions)
        .where(eq(modVersions.modId, modId))
        .orderBy(desc(modVersions.createdAt));
}

export async function getLatestModVersion(modId: string) {
    const [version] = await db
        .select()
        .from(modVersions)
        .where(eq(modVersions.modId, modId))
        .orderBy(desc(modVersions.createdAt))
        .limit(1);
    return version ?? null;
}

export async function getModVersionById(id: string) {
    const [version] = await db.select().from(modVersions).where(eq(modVersions.id, id));
    return version ?? null;
}

export async function createModVersion(data: typeof modVersions.$inferInsert) {
    const [version] = await db.insert(modVersions).values(data).returning();
    return version;
}

export async function getDependenciesForVersion(modVersionId: string) {
    return db
        .select()
        .from(modDependencies)
        .where(eq(modDependencies.modVersionId, modVersionId));
}

export async function getSessionUser(c) {
    const id = getCookie(c, "session");
    if (!id) return null;
    return getUserById(id);
}