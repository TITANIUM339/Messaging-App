import newKey from "@controllers/newKey";
import { Router } from "express";
import passport from "passport";

const router = Router();

const route = "/pgp";

router.use(route, passport.authenticate("accessToken", { session: false }));

router.patch(route, newKey.patch);

export default router;
