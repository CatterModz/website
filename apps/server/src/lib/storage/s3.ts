import {modVersions} from "@db/schema.ts";
import {db} from "../../../../../packages/db";

export async function uploadDummy(
    data: typeof modVersions.$inferInsert
): Promise<[typeof modVersions.$inferSelect | null, string | null]> {
    try {
        const [row] = await db.insert(modVersions).values(data).returning();
        return [row, null];
    } catch (e) {
        return [null, e instanceof Error ? e.message : "Failed to upload"];
    }
}