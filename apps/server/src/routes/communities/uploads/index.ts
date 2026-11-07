import {communities} from "@db/schema.ts";
import {apiError, useCommunities} from "@server/lib/utils";
import {communitiesRouter} from "@server/routes/communities";
import {uploadDummy} from "@server/lib/storage/s3.ts";

/**
 * export const modVersions = pgTable("mod_versions", {
    id: text("id").primaryKey(),
    mod_id: text("mod_id").notNull().references(() => mods.id),
    version: text("version").notNull(),           // semver string, e.g. "1.2.0"
    changelog: text("changelog"),
    file_url: text("file_url").notNull(),           // storage key/path, not raw bytes in db
    file_size: integer("file_size"),                // bytes
    sha256: text("sha256"),                        // integrity check on download
    game_version: text("game_version"),             // which game/platform version it targets
    created_at: timestamp("created_at").defaultNow(),
});
 */

communitiesRouter.post("/:communityId/uploads", async (c) => {
    const communityId = c.req.param("communityId");
    const [community]: typeof communities.$inferSelect[] = await useCommunities(communityId);

    if (!community) {
        return apiError(c, "Community not found", apiError.ERRORS.NOT_FOUND, 404);
    }

    const toUpload = {
        id: Date.now().toString(),
        mod_id: "mod_id_placeholder",
        version: "1.0.0",
        changelog: "Initial release",
        file_url: "path/to/file.zip",
        file_size: 123456,
        sha256: "sha256_placeholder",
        game_version: "1.0.0",
        created_at: new Date(),
    }

    const [success, error] = await uploadDummy(toUpload as any);
    return c.json(toUpload);
});