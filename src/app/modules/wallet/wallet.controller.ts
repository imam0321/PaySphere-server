import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { WalletService } from "./wallet.service";

const addMoney = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user as JwtPayload;
    const result = await WalletService.addMoney(userId, req.body.amount);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Add Money Successfully",
      data: result,
    });
  }
);

const cashIn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {userId: agentId} = req.user as JwtPayload;
    const { userWalletId, amount } = req.body;
    const result = await WalletService.cashIn(agentId, userWalletId, amount);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Cash In Successfully",
      data: result,
    });
  }
);

const cashOut = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {userId} = req.user as JwtPayload;
    const { agentWalletId, amount } = req.body;
    const result = await WalletService.cashOut(userId, agentWalletId, amount);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Cash Out Successfully",
      data: result,
    });
  }
);

export const WalletController = {
  addMoney,
  cashIn,
  cashOut
};
