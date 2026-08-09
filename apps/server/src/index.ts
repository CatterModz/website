// apps/server/src/index.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { modsRouter } from "./routes/mods";
import {authRouter} from "./routes/auth.ts";
import {usersRouter} from "./routes/users.ts";

const app = new Hono();

app.use("/api/*", cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.route("/api/auth", authRouter);
app.route("/api/mods", modsRouter);
app.route("/api/users", usersRouter);

export default {
    port: 3001,
    fetch: app.fetch,
};