import { Role } from "./user.interface";
import { User } from "./user.model";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { UserSearchableFields } from "./user.constant";
import { Wallet } from "../wallet/wallet.model";
import { WalletService } from "../wallet/wallet.service";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { TransactionService } from "../transaction/transaction.service";


const addMoney = async (userId: string, amount: number) => {
  const session = await Wallet.startSession();
  session.startTransaction();
  try {
    const wallet = await WalletService.addMoney(userId, amount, session);

    if (!wallet) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Money was not added to wallet!"
      );
    }

    const transaction = await TransactionService.addMoneyTransaction(
      wallet,
      amount,
      session
    );

    await session.commitTransaction();
    session.endSession();

    return transaction;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
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
  const queryBuilder = new QueryBuilder(
    User.find({ role: Role.user }).select("-password"),
    query
  );

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

const getSingleUser = async (phone: string) => {
  const userInfo = await User.findOne({ phone })
    .select("-password")
    .populate("walletId", "balance status");
  return {
    data: userInfo,
  };
};

export const UserService = {
  addMoney,
  getMe,
  getAllUser,
  getSingleUser,
};
