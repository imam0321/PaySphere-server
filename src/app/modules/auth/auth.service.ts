import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IUser, Role } from "../user/user.interface";
import { User } from "../user/user.model";
import { createUserTokens } from "../../utils/userTokens";
import bcryptjs from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { WalletService } from "../wallet/wallet.service";
import { TransactionService } from "../transaction/transaction.service";
import { Types } from "mongoose";

const register = async (payload: Partial<IUser>) => {
  const session = await User.startSession();
  session.startTransaction();
  
  try {
    const { email, password, role, ...rest } = payload;

    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
      throw new AppError(httpStatus.BAD_REQUEST, "User already Exist!");
    }

    const hashedPassword = await bcryptjs.hash(
      password as string,
      Number(envVars.BCRYPT_SALT_ROUND)
    );

    const [user] = await User.create(
      [
        {
          email,
          password: hashedPassword,
          commissionRate: role === Role.agent ? 5 : undefined,
          ...rest,
        },
      ],
      { session }
    );

    const userWallet = await WalletService.createWallet(user._id, session);

    user.walletId = userWallet._id as Types.ObjectId;
    await user.save({ session });

    if (user.role === "agent") {
      const agentInfo = user.toObject();
      delete agentInfo.password;
      await session.commitTransaction();
      session.endSession();
      return agentInfo;
    }

    const updatedUser = await TransactionService.initialFunding(
      userWallet,
      50,
      session
    );

    await session.commitTransaction();
    session.endSession();
    return {
      data: updatedUser,
    };
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `User Create Error! ${error.message}`
    );
  }
};

const credentialLogin = async (payload: Partial<IUser>) => {
  const { email, password } = payload;

  const isUserExist = await User.findOne({ email });

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Not Exist!");
  }

  const isPasswordMatched = await bcryptjs.compare(
    password as string,
    isUserExist.password as string
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid Password!");
  }

  const userTokens = createUserTokens(isUserExist);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: pass, ...rest } = isUserExist.toObject();

  return {
    accessToken: userTokens.accessToken,
    refreshToken: userTokens.refreshToken,
    user: rest,
  };
};

const changePassword = async (
  decodedToken: JwtPayload,
  oldPassword: string,
  newPassword: string
) => {
  const user = await User.findById(decodedToken.userId);

  const isOldPasswordMatch = await bcryptjs.compare(
    oldPassword,
    user!.password as string
  );

  if (!isOldPasswordMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Old password dose not match");
  }

  if (oldPassword === newPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "New password cannot be the same as old password"
    );
  }

  user!.password = await bcryptjs.hash(
    newPassword,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  user!.save();
};

export const AuthService = {
  register,
  credentialLogin,
  changePassword,
};
