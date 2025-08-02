import { ClientSession, Types } from "mongoose";
import { IWallet, WalletStatus } from "./wallet.interface";
import { Wallet } from "./wallet.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { TransactionService } from "../transaction/transaction.service";
import { findUserAndWallet } from "../../utils/findUserAndWallet";
import { getAdminWallet } from "../../utils/getAdminWallet";
import { incrementWalletBalance } from "../../utils/incrementWalletBalance";

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
    const { user, wallet } = await findUserAndWallet(userId, session);

    if (user.isApproved === false) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not permitted to add money. Please wait for approval."
      );
    }

    if (wallet.status === WalletStatus.blocked) {
      throw new AppError(httpStatus.FORBIDDEN, "Wallet is Blocked");
    }

    const updateWallet = await incrementWalletBalance(
      wallet._id,
      amount,
      session
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

// TODO: Agent isApproved
const cashIn = async (
  agentId: string,
  userWalletId: string,
  amount: number
) => {
  const session = await Wallet.startSession();
  session.startTransaction();
  try {
    const { wallet: agentWallet } = await findUserAndWallet(agentId, session);

    const userWallet = await Wallet.findById(userWalletId).session(session);
    if (!userWallet)
      throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");

    if (agentWallet.balance < amount)
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Agent wallet has insufficient balance"
      );

    const [updatedAgentWallet, updatedUserWallet] = await Promise.all([
      incrementWalletBalance(agentWallet._id, -amount, session),
      incrementWalletBalance(userWallet._id, amount, session),
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

const cashOut = async (
  userId: string,
  agentWalletId: string,
  amount: number
) => {
  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    const { user, wallet: userWallet } = await findUserAndWallet(
      userId,
      session
    );

    const agentWallet = await Wallet.findById(agentWalletId).session(session);
    if (!agentWallet)
      throw new AppError(httpStatus.NOT_FOUND, "Agent wallet not found");

    const feeRate = user.feeRate as number;
    const feeAmount = (feeRate / 1000) * amount;
    const totalAmount = amount + feeAmount;

    if (userWallet.balance < totalAmount)
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "User wallet has insufficient balance (including fee)"
      );

    const adminWallet = await getAdminWallet(session);

    const [updatedUserWallet, updatedAgentWallet, updatedAdminWallet] =
      await Promise.all([
        incrementWalletBalance(userWallet._id, -totalAmount, session),
        incrementWalletBalance(agentWallet._id, amount, session),
        incrementWalletBalance(adminWallet._id, feeAmount, session),
      ]);

    const transaction = await TransactionService.cashOut(
      updatedUserWallet,
      updatedAgentWallet,
      updatedAdminWallet,
      amount,
      feeAmount,
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
  cashOut,
};
