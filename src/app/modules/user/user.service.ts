import { User } from "./user.model";
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



export const UserService = {
  addMoney,
  getMe,
};
