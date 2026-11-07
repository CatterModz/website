import {communitiesRouter} from "./hono";
import {communities} from "@db/schema.ts";
import {apiError, useCommunities} from "@server/lib/utils";
import "./mods/index.ts";

export { communitiesRouter };

communitiesRouter.get("/:communityId", async (c) => {
    const communityId = c.req.param("communityId");
    const [community]: typeof communities.$inferSelect[] = await useCommunities(communityId);

    if (!community) {
        return apiError(c, "Community not found", apiError.ERRORS.NOT_FOUND, 404);
    }

    return c.json({...community});
});