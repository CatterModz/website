// apps/server/src/index.ts
import { cors } from "hono/cors";
import {authRouter} from "./routes/auth.ts";
import {usersRouter} from "./routes/users";
import {communitiesRouter} from "@server/routes/communities";
import {app} from "@server/routes/communities/hono";

app.use("/api/*", cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.route("/api/auth", authRouter);
// app.route("/api/mods", modsRouter);
app.route("/api/users", usersRouter);
// mods are under api/<id>/mods, so we don't need a top-level /api/mods route
app.route("/api/communities", communitiesRouter);

export default {
    port: 3001,
    fetch: app.fetch,
};