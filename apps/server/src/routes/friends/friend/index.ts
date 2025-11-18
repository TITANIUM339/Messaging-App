import friend from "@controllers/friend";
import checkFriend from "@middleware/checkFriend";
import { Router } from "express";

const router = Router();

const route = "/:userId";

router.use(route, checkFriend);

router.delete(route, friend.delete);

export default router;
