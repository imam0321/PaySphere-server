import { Router } from "express";
import { UserController } from "./user.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema } from "./user.validation";
import { AuthController } from "../auth/auth.controller";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  AuthController.registerUser
);
router.get("/", checkAuth("admin"), UserController.getAllUser);
router.get("/me", checkAuth(...Object.values(Role), "admin"), UserController.getMe);
router.get("/:phone", checkAuth("admin"), UserController.getSingleUser);

export const UserRoutes = router;
