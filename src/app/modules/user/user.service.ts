import AppError from "../../errorHelpers/AppError";
import { IUser, Role } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import { IWallet, WalletStatus } from "../wallet/wallet.interface";
import { Wallet } from "../wallet/wallet.model";
import {
  ITransaction,
  TransactionStatus,
  TransactionType,
} from "../transaction/transaction.interface";
import { Transaction } from "../transaction/transaction.model";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { UserSearchableFields } from "./user.constant";

const createUser = async (payload: Partial<IUser>) => {
  const session = await User.startSession();
  try {
    session.startTransaction();
    const { email, password, role, ...rest } = payload;

    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
      throw new AppError(httpStatus.BAD_REQUEST, "User already Exist!");
    }

    if (role !== "user" && role !== "agent") {
      throw new AppError(httpStatus.BAD_REQUEST, "Role must be User or Agent");
    }

    const hashedPassword = await bcryptjs.hash(
      password as string,
      Number(envVars.BCRYPT_SALT_ROUND)
    );

    const normalizedRole = role?.toLowerCase();

    const user = await User.create(
      [
        {
          email,
          password: hashedPassword,
          role: normalizedRole,
          ...rest,
        },
      ],
      { session }
    );

    const userWalletPayload: IWallet = {
      userId: user[0]._id,
      balance: 0,
      currency: "BDT",
      status: WalletStatus.active,
    };

    const userWallet = await Wallet.create([userWalletPayload], { session });

    user[0].walletId = userWallet[0]._id;
    await user[0].save({ session });

    if (user[0].role === "agent") {
      const agentInfo = user[0].toObject();
      delete agentInfo.password;
      await session.commitTransaction();
      session.endSession();
      return agentInfo;
    }

    const admin = await User.findOne({ email: envVars.ADMIN_EMAIL });
    if (!admin) {
      throw new AppError(httpStatus.BAD_REQUEST, "Admin not Found!");
    }

    const adminWallet = await Wallet.findOne({ userId: admin._id });
    if (!adminWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Admin not found!");
    }

    const fundingAmount: number = 50;

    if (adminWallet.balance < fundingAmount) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Admin wallet has insufficient balance"
      );
    }

    adminWallet.balance -= fundingAmount;
    userWallet[0].balance += fundingAmount;

    await Promise.all([
      adminWallet.save({ session }),
      userWallet[0].save({ session }),
    ]);

    const adminTransactionPayload: ITransaction = {
      fromWalletId: adminWallet._id,
      toWalletId: userWallet[0]._id,
      type: TransactionType.cash_out,
      status: TransactionStatus.approved,
      amount: fundingAmount,
      commission: 0,
      currentBalance: adminWallet.balance,
      initiatedBy: admin._id,
      purpose: "Initial funding to new user",
    };

    const userTransactionPayload: ITransaction = {
      fromWalletId: adminWallet._id,
      toWalletId: userWallet[0]._id,
      type: TransactionType.cash_in,
      status: TransactionStatus.approved,
      amount: 50,
      commission: 0,
      currentBalance: 50,
      initiatedBy: adminWallet.userId,
      purpose: "Initial admin funding",
    };

    const [adminTransaction, userTransaction] = await Promise.all([
      Transaction.create([adminTransactionPayload], { session }),
      Transaction.create([userTransactionPayload], { session }),
    ]);

    await User.findByIdAndUpdate(
      admin._id,
      {
        $push: { transactionId: adminTransaction[0]._id },
      },
      { session }
    );

    const updateUser = await User.findByIdAndUpdate(
      user[0]._id,
      {
        $push: { transactionId: userTransaction[0]._id },
      },
      { new: true, runValidators: true, session }
    )
      .populate("walletId", "balance")
      .populate("transactionId", "fromWalletId type")
      .select("-password");

    await session.commitTransaction();
    session.endSession();
    return {
      data: updateUser,
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

const getMe = async (userId: string) => {
  const myInfo = await User.findById(userId)
    .select("-password")
    .populate("walletId", "balance status");
  return {
    data: myInfo,
  };
};

const getAllUser = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find(), query);

  const users = queryBuilder
    .search(UserSearchableFields)
    .sort()
    .fields()
    .filter()
    .paginate();

  const [data, meta] = await Promise.all([
    users.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

export const UserService = {
  createUser,
  getMe,
  getAllUser,
};
