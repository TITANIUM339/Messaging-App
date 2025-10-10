import logout from "@controllers/logout";
import { Router } from "express";
import passport from "passport";

const router = Router();

const route = "/logout";

router.post(
    route,
    passport.authenticate("accessToken", { session: false }),
    logout.post,
);

export default router;
