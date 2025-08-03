import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { TransactionController } from "./transaction.controller";

const router = Router();

router.get("/", checkAuth(Role.admin), TransactionController.getAllTransaction);

export const TransactionRoutes = router;
