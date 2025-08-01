import { Types } from "mongoose";
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { IWallet, IWalletDocument } from "../wallet/wallet.interface";
import { Wallet } from "../wallet/wallet.model";
import {
  ITransaction,
  TransactionStatus,
  TransactionType,
} from "./transaction.interface";
import { Transaction } from "./transaction.model";
import httpStatus from "http-status-codes";

const createTransaction = async (
  transactionPayload: ITransaction,
  session?: any
) => {
  const [transaction] = await Transaction.create([transactionPayload], {
    session,
  });
  return transaction;
};

const initialFunding = async (
  userWallet: IWalletDocument,
  initialFundingAmount: number,
  session: any
) => {
  const admin = await User.findOne({ email: process.env.ADMIN_EMAIL });

  if (!admin) throw new AppError(httpStatus.NOT_FOUND, "Admin not found");

  const adminWallet = await Wallet.findOne({ userId: admin._id });

  if (!adminWallet)
    throw new AppError(httpStatus.NOT_FOUND, "Admin wallet not found");

  if (adminWallet.balance < initialFundingAmount) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Admin wallet has insufficient balance"
    );
  }

  if (!userWallet) {
    throw new AppError(httpStatus.BAD_REQUEST, "User wallet not found");
  }

  adminWallet.balance -= initialFundingAmount;
  userWallet.balance += initialFundingAmount;

  await Promise.all([
    adminWallet.save({ session }),
    userWallet.save({ session }),
  ]);

  const sharedTransactionPayload = {
    fromWalletId: adminWallet._id as Types.ObjectId,
    toWalletId: userWallet._id as Types.ObjectId,
    amount: initialFundingAmount,
    commission: 0,
    status: TransactionStatus.approved,
  };

  const adminTransactionPayload: ITransaction = {
    ...sharedTransactionPayload,
    type: TransactionType.cash_out,
    currentBalance: adminWallet.balance,
    initiatedBy: admin._id,
    purpose: "Initial funding to new user",
  };

  const userTransactionPayload: ITransaction = {
    ...sharedTransactionPayload,
    type: TransactionType.cash_in,
    currentBalance: userWallet.balance,
    initiatedBy: userWallet.userId,
    purpose: "Initial admin funding",
  };

  const [adminTransaction, userTransaction] = await Promise.all([
    createTransaction(adminTransactionPayload, session),
    createTransaction(userTransactionPayload, session),
  ]);

  await User.findByIdAndUpdate(
    admin._id,
    { $push: { transactionId: adminTransaction._id } },
    { session }
  );

  const user = await User.findByIdAndUpdate(
    userWallet.userId,
    { $push: { transactionId: userTransaction._id } },
    { new: true, runValidators: true, session }
  )
    .populate("walletId", "balance")
    .populate("transactionId", "fromWalletId type")
    .select("-password");

  return user;
};

export const TransactionService = {
  initialFunding,
};
