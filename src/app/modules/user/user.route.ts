import { Router } from "express";
import { UserController } from "./user.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";

const router = Router();

router.post("/register", UserController.createUser);
router.get("/me", checkAuth(...Object.values(Role), "admin"), UserController.getMe);

export const UserRoutes = router;
