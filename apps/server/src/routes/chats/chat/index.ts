import chat from "@controllers/chat";
import checkChat from "@middleware/checkChat";
import { Router } from "express";

const router = Router();

const route = "/:chatId";

router.param("chatId", checkChat);

router.get(route, chat.get);

export default router;
