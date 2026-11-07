import { usersRouter } from "@server/routes/communities/hono";
import {getUserById, getSessionUser} from "@db/queries.ts";
import {discordUsers} from "@db/schema.ts";
import {apiError} from "@server/lib/utils";

export { usersRouter };

const PUBLIC_FIELDS = ["id", "username", "avatar"] as const;

function parseSafe(user: typeof discordUsers.$inferSelect, isOwnProfile: boolean) {
    if (isOwnProfile) return user;

    const safe: Partial<typeof user> = {};
    for (const field of PUBLIC_FIELDS) {
        // @ts-expect-error
        safe[field] = user[field];
    }
    return safe;
}

usersRouter.get("/:id", async (c) => {
    const sessionUser = await getSessionUser(c);
    if (!sessionUser) return apiError(c, "You are not logged in", apiError.ERRORS.NOT_LOGGED_IN, 401);

    const id = c.req.param("id");
    if (!id) return apiError(c, "Missing id", apiError.ERRORS.MISSING_ID, 400);

    const user = await getUserById(id);
    if (!user) return apiError(c, "Unknown user", apiError.ERRORS.NOT_FOUND, 404);

    const isOwnProfile = sessionUser.id === user.id;
    return c.json({ ...parseSafe(user, isOwnProfile), isOwnProfile });
});