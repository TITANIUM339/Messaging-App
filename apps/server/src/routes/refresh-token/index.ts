import refreshToken from "@controllers/refreshToken";
import { Router } from "express";
import passport from "passport";

const router = Router();

const route = "/refresh-token";

router.get(
    route,
    passport.authenticate("refreshToken", { session: false }),
    refreshToken.get,
);

export default router;
