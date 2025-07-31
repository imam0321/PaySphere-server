import { Router } from "express";
import { createUserZodSchema } from "../user/user.validation";
import { AuthController } from "../auth/auth.controller";
import { validateRequest } from "../../middlewares/validateRequest";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  AuthController.registerAgent
);

export const AgentRoutes = router;
