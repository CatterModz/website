import {db, discordUsers, mods} from "../../../../../packages/db";
import {eq} from "drizzle-orm"
import {communities} from "@db/schema.ts";

enum CommunityErrorCode {
    NOT_FOUND = 20001,
    MISSING_ID = 20002,
    NOT_LOGGED_IN = 20003,
}

export function apiError(c: any, message: string, code: CommunityErrorCode, status: 400 | 401 | 404 = 400) {
    return c.json({message, code}, status);
}

export async function useCommunities(communityId: string, limit: number = 1) {
   return await db.select().from(communities).where(eq(communities.id, communityId)).limit(limit);
}

export async function useDiscordUser(discordId: string) {
    return await db.select().from(discordUsers).where(eq(discordUsers.id, discordId)).limit(1);
}

export async function useModsFromCommunity(communityId: string) {
    return await db.select().from(mods).where(eq(mods.community_id, communityId));
}

apiError.ERRORS = CommunityErrorCode;