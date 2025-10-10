import signup from "@controllers/signup";
import { Router } from "express";

const router = Router();

const route = "/signup";

router.post(route, signup.post);

export default router;
