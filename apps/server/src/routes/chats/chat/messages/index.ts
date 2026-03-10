import messages from "@controllers/messages";
import { Router } from "express";

const router = Router({ mergeParams: true });

const route = "/messages";

router.route(route).post(messages.post).get(messages.get);

export default router;
