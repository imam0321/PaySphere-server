import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import { TransactionService } from "./transaction.service";

const getAllTransaction = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await TransactionService.getAllTransaction(
      req.query as Record<string, string>
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All Transactions retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

export const TransactionController = {
  getAllTransaction,
};
