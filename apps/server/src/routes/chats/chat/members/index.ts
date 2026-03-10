import members from "@controllers/members";
import { Router } from "express";

const router = Router({ mergeParams: true });

const route = "/members";

router.get(route, members.get);

export default router;
