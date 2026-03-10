import chats from "@controllers/chats";
import { Router } from "express";
import passport from "passport";

const router = Router();

const route = "/chats";

router.use(route, passport.authenticate("accessToken", { session: false }));

router.route(route).get(chats.get);

export default router;
