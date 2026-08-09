import { Hono } from "hono";
import { setCookie, getCookie } from "hono/cookie"
import { db, discordUsers } from "../../../../packages/db";
import { eq } from "drizzle-orm";

export const authRouter = new Hono();

authRouter.get("/discord", (c) => {
    console.log("client_id:", process.env.DISCORD_CLIENT_ID);
    console.log("redirect_uri:", process.env.DISCORD_REDIRECT_URI);
    const params = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        redirect_uri: process.env.DISCORD_REDIRECT_URI!,
        response_type: "code",
        scope: "identify email",
    });
    return c.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
});

authRouter.get("/discord/callback", async (c) => {
    const code = c.req.query("code");
    if (!code) return c.text("Missing code", 400);

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID!,
            client_secret: process.env.DISCORD_CLIENT_SECRET!,
            grant_type: "authorization_code",
            code,
            redirect_uri: process.env.DISCORD_REDIRECT_URI!,
        }),
    });
    const { access_token } = await tokenRes.json();

    const userRes = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${access_token}` },
    });
    const user = await userRes.json();

    await db.insert(discordUsers).values({
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
    }).onConflictDoUpdate({
        target: discordUsers.id,
        set: {
            username: user.username, avatar: user.avatar,
        }
    })

    setCookie(c, "session", user.id, {
        httpOnly: true,
        path: "/",
        sameSite: "Lax",
    });

    return c.redirect("http://localhost:5173/");
});

authRouter.get("/me", async (c) => {
    const id = getCookie(c, "session");
    if (!id) return c.json(null, 401)

    const [user] = await db.select().from(discordUsers).where(eq(discordUsers.id, id));
    if (!user) return c.json(null, 401)

    return c.json(user)
});