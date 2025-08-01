import { Router } from "express";
import { UserController } from "./user.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema } from "./user.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  UserController.registerUser
);
router.post("/add-money", checkAuth(Role.user), UserController.addMoney);

router.get(
  "/me",
  checkAuth(...Object.values(Role), "admin"),
  UserController.getMe
);

export const UserRoutes = router;
