import { ClientSession, Types } from "mongoose";
import { IWallet, WalletStatus } from "./wallet.interface";
import { Wallet } from "./wallet.model";
import { User } from "../user/user.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { TransactionService } from "../transaction/transaction.service";

const createWallet = async (
  userId: Types.ObjectId,
  session?: ClientSession
) => {
  const walletPayload: IWallet = {
    userId,
    balance: 0,
    currency: "BDT",
    status: WalletStatus.active,
  };

  const wallet = await Wallet.create([walletPayload], { session });
  return wallet[0];
};

const addMoney = async (userId: string, amount: number) => {
  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (user.isApproved === false) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not permitted to add money. Please wait for approval."
      );
    }

    const wallet = await Wallet.findById(user.walletId);

    if (!wallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
    }

    if (wallet.status === WalletStatus.blocked) {
      throw new AppError(httpStatus.FORBIDDEN, "Wallet is Blocked");
    }

    const updateWallet = await Wallet.findByIdAndUpdate(
      user.walletId,
      {
        $inc: { balance: amount },
      },
      { new: true, runValidators: true, session }
    );

    if (!updateWallet) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Money was not added to wallet!"
      );
    }

    const transaction = await TransactionService.addMoney(
      updateWallet,
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

const cashIn = async (
  agentId: string,
  userWalletId: string,
  amount: number
) => {
  const session = await Wallet.startSession();
  session.startTransaction();
  try {
    const agent = await User.findById(agentId);
    if (!agent) throw new AppError(httpStatus.NOT_FOUND, "Agent not found");

    const agentWallet = await Wallet.findById(agent.walletId).session(session);
    if (!agentWallet)
      throw new AppError(httpStatus.NOT_FOUND, "Agent wallet not found");

    const userWallet = await Wallet.findById(userWalletId).session(session);
    if (!userWallet)
      throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");

    if (agentWallet.balance < amount)
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Agent wallet has insufficient balance"
      );

    const [updatedAgentWallet, updatedUserWallet] = await Promise.all([
      Wallet.findByIdAndUpdate(
        agentWallet._id,
        { $inc: { balance: -amount } },
        { new: true, runValidators: true, session }
      ),
      Wallet.findByIdAndUpdate(
        userWallet._id,
        { $inc: { balance: amount } },
        { new: true, runValidators: true, session }
      ),
    ]);

    const transaction = await TransactionService.cashIn(
      updatedAgentWallet,
      updatedUserWallet,
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

export const WalletService = {
  createWallet,
  addMoney,
  cashIn,
};
