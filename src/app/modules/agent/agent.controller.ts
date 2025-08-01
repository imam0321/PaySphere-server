import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { AuthService } from "../auth/auth.service";
import { Role } from "../user/user.interface";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { AgentService } from "./agent.service";

const registerAgent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await AuthService.register(req.body, Role.agent);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Agent registered successfully",
      data: result,
    });
  }
);

const getAllAgent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await AgentService.getAllAgent(req.query as Record<string, string>);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All Agent retrieved successfully",
      data: result
    });
  }
);

export const AgentController = {
  registerAgent,
  getAllAgent,
};
