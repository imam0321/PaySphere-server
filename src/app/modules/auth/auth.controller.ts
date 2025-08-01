import catchAsync from "../../utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { setAuthCookie } from "../../utils/setCookies";
import { AuthService } from "./auth.service";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

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

const changePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    await AuthService.changePassword(
      decodedToken as JwtPayload,
      oldPassword,
      newPassword
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password Changed Successfully",
      data: null,
    });
  }
);

const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User logged out Successfully",
      data: null,
    });
  }
);

export const AuthController = {
  credentialLogin,
  changePassword,
  logout,
};
