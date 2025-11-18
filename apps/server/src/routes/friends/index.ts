import friends from "@controllers/friends";
import { Router } from "express";
import passport from "passport";
import friendRouter from "./friend";

const router = Router();

const route = "/friends";

router.use(route, passport.authenticate("accessToken", { session: false }));
router.use(route, friendRouter);

router.get(route, friends.get);

export default router;
