import login from "@controllers/login";
import { Router } from "express";
import passport from "passport";

const router = Router();

const route = "/login";

router.post(
    route,
    passport.authenticate("local", { session: false }),
    login.post,
);

export default router;
