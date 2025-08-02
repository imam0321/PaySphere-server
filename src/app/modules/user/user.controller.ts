/* eslint-disable @typescript-eslint/no-unused-vars */
import catchAsync from "../../utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { Role } from "./user.interface";
import { AuthService } from "../auth/auth.service";

const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await AuthService.register(req.body, Role.user);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "User registered successfully",
      data: result,
    });
  }
);

export const UserController = {
  registerUser,
};
