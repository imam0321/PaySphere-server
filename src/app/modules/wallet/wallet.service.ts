import { Types } from "mongoose";
import { IWallet, WalletStatus } from "./wallet.interface";
import { Wallet } from "./wallet.model";
import { User } from "../user/user.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";

const createWallet = async (userId: Types.ObjectId, session?: any) => {
  const walletPayload: IWallet = {
    userId,
    balance: 0,
    currency: "BDT",
    status: WalletStatus.active,
  };

  const wallet = await Wallet.create([walletPayload], { session });
  return wallet[0];
};

const addMoney = async (userId: string, amount: number, session?: any) => {
  const user = await User.findById(userId);

  if (user?.isApproved === false) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not permitted to add money. Please wait for approval."
    );
  }

  const wallet = await Wallet.findById(user?.walletId);

  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }

  if (wallet?.status === WalletStatus.blocked) {
    throw new AppError(httpStatus.FORBIDDEN, "Wallet is Blocked");
  }

  const updateWallet = await Wallet.findByIdAndUpdate(
    user?.walletId,
    {
      $inc: { balance: amount },
    },
    { new: true, runValidators: true, session }
  );
  return updateWallet;
};

export const WalletService = {
  createWallet,
  addMoney,
};
