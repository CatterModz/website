import {communities, mods} from "@db/schema.ts";
import {eq} from "drizzle-orm";
import {apiError, useCommunities, useModsFromCommunity} from "@server/lib/utils";
import {db} from "../../../../../../packages/db";
import {communitiesRouter} from "../hono";

communitiesRouter.get("/all", async (c) => {
    // lazy way to get all
    const data = await db.select().from(communities).where(eq(communities.is_public, true));
    return c.json(data);
});

communitiesRouter.get("/:communityId/mods", async (c) => {
    const communityId = c.req.param("communityId");
    const [community]: typeof communities.$inferSelect[] = await useCommunities(communityId);

    if (!community) {
        return apiError(c, "Community not found", apiError.ERRORS.NOT_FOUND, 404);
    }

    const _mods = await useModsFromCommunity(communityId);

    const result = {
        community_id: communityId,
        mods: _mods
    }

    return c.json(result);
});
