import {mods} from "@db/schema.ts";

export function uploadDummy(data: typeof mods.$inferInsert)
{
    console.log("Uploading dummy data to S3:", data);
    return [true, null]
}