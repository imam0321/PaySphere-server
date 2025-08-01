import { Router } from "express";
import { createUserZodSchema } from "../user/user.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { AgentController } from "./agent.controller";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  AgentController.registerAgent
);

export const AgentRoutes = router;
