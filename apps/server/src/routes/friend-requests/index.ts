import friendRequests from "@controllers/friendRequests";
import { Router } from "express";
import passport from "passport";
import friendRequestRouter from "./friend-request";

const router = Router();

const route = "/friend-requests";

router.use(route, passport.authenticate("accessToken", { session: false }));
router.use(route, friendRequestRouter);

router.post(route, friendRequests.post);

export default router;
