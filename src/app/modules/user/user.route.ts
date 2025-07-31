import { Router } from "express";
import { UserController } from "./user.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema } from "./user.validation";

const router = Router();

router.post("/register", validateRequest(createUserZodSchema), UserController.createUser);
router.get("/", checkAuth("admin"), UserController.getAllUser);
router.get("/me", checkAuth(...Object.values(Role), "admin"), UserController.getMe);

export const UserRoutes = router;
