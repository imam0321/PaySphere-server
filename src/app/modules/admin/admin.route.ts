import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { AdminController } from "./admin.controller";

const router = Router();

router.get("/all-user", checkAuth(Role.admin), AdminController.getAllUser);
router.get("/all-agent", checkAuth(Role.admin), AdminController.getAllAgent);
router.get("/:id", checkAuth(Role.admin), AdminController.getSingleUserOrAgent);

export const AdminRoutes = router;
