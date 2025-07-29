import { Router } from "express";

export const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes
  }
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
