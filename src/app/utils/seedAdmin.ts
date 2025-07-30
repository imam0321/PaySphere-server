/* eslint-disable no-console */
import { envVars } from "../config/env";
import {
  IAuthProvider,
  IsActive,
  IUser,
  Role,
} from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import bcryptjs from "bcryptjs";
import { IWallet, WalletStatus } from "../modules/wallet/wallet.interface";
import { Wallet } from "../modules/wallet/wallet.model";
import mongoose from "mongoose";
import { Transaction } from "../modules/transaction/transaction.model";
import {
  ITransaction,
  TransactionStatus,
  TransactionType,
} from "../modules/transaction/transaction.interface";

export const seedAdmin = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const isAdminExist = await User.findOne({ email: envVars.ADMIN_EMAIL });

    if (isAdminExist) {
      console.log("Admin already exists.");
      return;
    }

    const hashPassword = await bcryptjs.hash(
      envVars.ADMIN_PASSWORD,
      Number(envVars.BCRYPT_SALT_ROUND)
    );

    const authProvider: IAuthProvider = {
      provider: "Credential",
      providerId: envVars.ADMIN_EMAIL,
    };

    const adminPayload: IUser = {
      name: "Admin",
      email: envVars.ADMIN_EMAIL,
      role: Role.admin,
      password: hashPassword,
      isVerified: true,
      isActive: IsActive.active,
      auths: [authProvider],
    };

    const createAdmin = await User.create([adminPayload], { session });

    if (!createAdmin) {
      return;
    }

    const walletPayload: IWallet = {
      userId: createAdmin[0]._id,
      balance: 200000,
      currency: "BDT",
      status: WalletStatus.active,
    };

    const createWallet = await Wallet.create([walletPayload], { session });

    if (!createWallet) {
      return;
    }

    const transactionPayload: ITransaction = {
      fromWalletId: createWallet[0]._id,
      toWalletId: createWallet[0]._id,
      type: TransactionType.add_money,
      status: TransactionStatus.approved,
      amount: 200000,
      commission: 0,
      currentBalance: 200000,
      initiatedBy: createAdmin[0]._id,
      purpose: "Initial admin funding",
    };

    const createdTransaction = await Transaction.create([transactionPayload], {
      session,
    });

    createAdmin[0].walletId = createWallet[0]._id;
    createAdmin[0].transactionId = [createdTransaction[0]._id];
    await createAdmin[0].save();

    await session.commitTransaction();
    session.endSession();
    console.log("Admin and wallet seeded successfully.");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
  }
};
