import chat from "@controllers/chat";
import checkChat from "@middleware/checkChat";
import { Router } from "express";
import membersRouter from "./members";

const router = Router();

const route = "/:chatId";

router.param("chatId", checkChat);

router.use(route, membersRouter);

router.get(route, chat.get);

export default router;
