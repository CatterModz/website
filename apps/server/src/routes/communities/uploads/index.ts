import {communities, discordUsers, mods, modVersions} from "@db/schema.ts";
import {and, eq} from "drizzle-orm";
import {apiError, useCommunities} from "@server/lib/utils";
import {communitiesRouter} from "@server/routes/communities";
import {db} from "../../../../../../packages/db";
import {getSessionUser} from "@db/queries.ts";
import {getSignedCookie} from "hono/cookie";

function slugify(s: string) {
    return s.toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

communitiesRouter.post("/:communityId/uploads", async (c) => {
    const communityId = c.req.param("communityId");
    const [community] = await useCommunities(communityId);
    if (!community) {
        return apiError(c, "Community not found", apiError.ERRORS.NOT_FOUND, 404);
    }

    const body = await c.req.parseBody();
    const name = String(body.name ?? "").trim();
    const version = String(body.version ?? "1.0.0");
    const file = body.file;

    if (!name) return c.json({message: "Missing name"}, 400);
    if (!(file instanceof File)) return c.json({message: "Missing file"}, 400);

    const slug = slugify(name);
    if (!slug) return c.json({message: "Invalid name"}, 400);

    const founderId = await getSessionUser(c)
    console.log(founderId)

    // slug is globally unique right now
    const [taken] = await db.select({id: mods.id}).from(mods)
        .where(eq(mods.slug, slug)).limit(1);
    if (taken) return c.json({message: "Slug already taken"}, 409);

    const buf = new Uint8Array(await file.arrayBuffer());
    const sha256 = new Bun.CryptoHasher("sha256").update(buf).digest("hex");

    try {
        const result = await db.transaction(async (tx) => {
            const [mod] = await tx.insert(mods).values({
                id: crypto.randomUUID(),
                community_id: communityId,
                slug,
                name,
                description: body.description ? String(body.description) : null,
                founder_id: founderId,
            }).returning();

            const [ver] = await tx.insert(modVersions).values({
                id: crypto.randomUUID(),
                mod_id: mod.id,
                version,
                changelog: body.changelog ? String(body.changelog) : null,
                file_url: `mods/${mod.id}/${version}/${file.name}`, // real S3 key later
                file_size: file.size,
                sha256,
            }).returning();

            return {mod, version: ver};
        });

        // TODO: upload `buf` to S3 at file_url (do it after the DB commit succeeds,
        // or before and delete on failure, so you don't orphan rows or files)
        return c.json(result, 201);
    } catch (e) {
        return c.json({message: e instanceof Error ? e.message : "Upload failed"}, 500);
    }
});