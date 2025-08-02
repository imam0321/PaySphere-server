import { Router } from "express";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.post("/login", AuthController.credentialLogin);
router.post("/me", checkAuth(...Object.values(Role)), AuthController.getMe);
router.post("/refresh-token", AuthController.getNewAccessToken);
router.post(
  "/change-password",
  checkAuth(...Object.values(Role)),
  AuthController.changePassword
);
router.post("/logout", AuthController.logout);

export const AuthRoutes = router;
