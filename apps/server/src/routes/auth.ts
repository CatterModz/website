import { Hono } from "hono";
import { getSignedCookie, setSignedCookie, deleteCookie } from "hono/cookie";
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, discordUsers } from "../../../../packages/db";

export const authRouter = new Hono();

const secret = process.env.COOKIE_SECRET!;
const cookie = {
    httpOnly: true,
    sameSite: "Lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
};

authRouter.get("/discord", async (c) => {
    const state = randomBytes(16).toString("base64url");
    await setSignedCookie(c, "oauth_state", state, secret, { ...cookie, maxAge: 600 });

    const params = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        redirect_uri: process.env.DISCORD_REDIRECT_URI!,
        response_type: "code",
        scope: "identify email",
        state,
    });
    return c.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
});

authRouter.get("/discord/callback", async (c) => {
    const code = c.req.query("code");
    const expected = await getSignedCookie(c, secret, "oauth_state");
    deleteCookie(c, "oauth_state", { path: "/" });

    if (!code || !expected || expected !== c.req.query("state")) {
        return c.text("Bad request", 400);
    }

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
    if (!tokenRes.ok || !access_token) return c.text("Discord auth failed", 502);

    const userRes = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${access_token}` },
    });
    const user = await userRes.json();
    if (!userRes.ok || !user.id) return c.text("Discord auth failed", 502);

    await db.insert(discordUsers).values({
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
    }).onConflictDoUpdate({
        target: discordUsers.id,
        set: { email: user.email, username: user.username, avatar: user.avatar },
    });

    await setSignedCookie(c, "session", user.id, secret, { ...cookie, maxAge: 60 * 60 * 24 * 30 });
    return c.redirect(process.env.FRONTEND_URL ?? "http://localhost:5173");
});

authRouter.get("/me", async (c) => {
    const id = await getSignedCookie(c, secret, "session");
    if (!id) return c.json(null, 401);

    const [user] = await db.select().from(discordUsers).where(eq(discordUsers.id, id));
    return user ? c.json(user) : c.json(null, 401);
});

authRouter.post("/logout", (c) => {
    deleteCookie(c, "session", { path: "/" });
    return c.json({ ok: true });
});