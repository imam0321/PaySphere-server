import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { TransactionController } from "./transaction.controller";

const router = Router();

router.get("/", checkAuth(Role.admin), TransactionController.getAllTransaction);
router.get("/:id", checkAuth(Role.admin), TransactionController.getSingleTransaction);
router.get(
  "/my-transaction",
  checkAuth(...Object.values(Role)),
  TransactionController.getMyTransactionHistory
);

export const TransactionRoutes = router;
