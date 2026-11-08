import {Hono} from "hono";

export const app = new Hono();
export const authRouter = new Hono();
export const usersRouter = new Hono();
export const communitiesRouter = new Hono();