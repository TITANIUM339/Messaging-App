import addFriend from "@controllers/addFriend";
import { Router } from "express";
import passport from "passport";

const router = Router();

const route = "/friend-requests";

router.post(
    route,
    passport.authenticate("accessToken", { session: false }),
    addFriend.post,
);

export default router;
