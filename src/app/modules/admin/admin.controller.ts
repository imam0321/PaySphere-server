import catchAsync from "../../utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { AdminService } from "./admin.service";

const getAllUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await AdminService.getAllUser(
      req.query as Record<string, string>
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All Users retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

const getAllAgent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await AdminService.getAllAgent(
      req.query as Record<string, string>
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All Agent retrieved successfully",
      data: result,
    });
  }
);
// TODO
const getSingleUserOrAgent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await AdminService.getSingleUserOrAgent(req.params.phone);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User Retrieved Successfully",
      data: result,
    });
  }
);

export const AdminController = {
  getAllUser,
  getAllAgent,
  getSingleUserOrAgent,
};
