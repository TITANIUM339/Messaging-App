import friendRequest from "@controllers/friendRequest";
import checkFriendRequest from "@middleware/checkFriendRequest";
import onlyAllowFriendRequestReceiver from "@middleware/onlyAllowFriendRequestReceiver";
import { Router } from "express";

const router = Router();

const route = "/:senderId-:receiverId";

router.use(route, checkFriendRequest);

router.route(route).post(onlyAllowFriendRequestReceiver, friendRequest.post);

export default router;
