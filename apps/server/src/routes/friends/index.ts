import friends from "@controllers/friends";
import { Router } from "express";
import passport from "passport";

const router = Router();

const route = "/friends";

router.use(route, passport.authenticate("accessToken", { session: false }));

router.get(route, friends.get);

export default router;
