import { Hono } from "hono";

export const modsRouter = new Hono();

modsRouter.get("/", async (c) => {
    const mods = [{ id: "1", name: "Example Mod" }];
    return c.json(mods);
});

modsRouter.get("/:id", async (c) => {
    const id = c.req.param("id");
    return c.json({ id, name: "Example Mod" });
});