import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { StatsController } from "./stats.controller";

const router = Router();


router.get("/transaction", checkAuth(...Object.values(Role)), StatsController.getTransactionStats);


export const StatsRoutes = router;