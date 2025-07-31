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
  const transaction = await Transaction.create([transactionPayload], {
    session,
  });
  return transaction[0];
};

const initialFunding = async (
  userWallet: IWalletDocument,
  fundingAmount: number,
  session: any
) => {
  const admin = await User.findOne({ email: process.env.ADMIN_EMAIL });

  if (!admin) throw new AppError(httpStatus.NOT_FOUND, "Admin not found");

  const adminWallet = await Wallet.findOne({ userId: admin._id });

  if (!adminWallet)
    throw new AppError(httpStatus.NOT_FOUND, "Admin wallet not found");

  if (adminWallet.balance < fundingAmount) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Admin wallet has insufficient balance"
    );
  }

  if (!userWallet) {
    throw new AppError(httpStatus.FORBIDDEN, "User wallet not found");
  }

  adminWallet.balance -= fundingAmount;
  userWallet.balance += fundingAmount;

  await Promise.all([
    adminWallet.save({ session }),
    userWallet.save({ session }),
  ]);

  // Create transactions
  const adminTransactionPayload: ITransaction = {
    fromWalletId: adminWallet._id as Types.ObjectId,
    toWalletId: userWallet._id as Types.ObjectId,
    type: TransactionType.cash_out,
    status: TransactionStatus.approved,
    amount: fundingAmount,
    commission: 0,
    currentBalance: adminWallet.balance,
    initiatedBy: admin._id,
    purpose: "Initial funding to new user",
  };

  const userTransactionPayload: ITransaction = {
    fromWalletId: adminWallet._id as Types.ObjectId,
    toWalletId: userWallet._id as Types.ObjectId,
    type: TransactionType.cash_in,
    status: TransactionStatus.approved,
    amount: fundingAmount,
    commission: 0,
    currentBalance: userWallet.balance,
    initiatedBy: userWallet.userId,
    purpose: "Initial admin funding",
  };

  const [adminTransaction, userTransaction] = await Promise.all([
    createTransaction(adminTransactionPayload, session),
    createTransaction(userTransactionPayload, session),
  ]);

  // Push transactions to users
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
