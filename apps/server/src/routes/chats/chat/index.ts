import chat from "@controllers/chat";
import checkChat from "@middleware/checkChat";
import { Router } from "express";
import membersRouter from "./members";
import messagesRouter from "./messages";

const router = Router();

const route = "/:chatId";

router.param("chatId", checkChat);

router.use(route, membersRouter, messagesRouter);

router.get(route, chat.get);

export default router;
