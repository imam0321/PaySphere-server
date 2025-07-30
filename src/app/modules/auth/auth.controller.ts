import catchAsync from "../../utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { setAuthCookie } from "../../utils/setCookies";
import { AuthService } from "./auth.service";
import httpStatus from "http-status-codes";

const credentialLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const loginInfo = await AuthService.credentialLogin(req.body);

    setAuthCookie(res, loginInfo);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User Login Successfully",
      data: loginInfo,
    });
  }
);

export const AuthController = {
  credentialLogin,
};
