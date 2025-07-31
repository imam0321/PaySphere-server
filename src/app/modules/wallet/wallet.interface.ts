import { Document, Types } from "mongoose";

export enum WalletStatus {
  active = "active",
  blocked = "blocked",
}

export interface IWallet {
  userId: Types.ObjectId;
  balance: number;
  currency: "BDT";
  status: WalletStatus;
}

export interface IWalletDocument extends IWallet, Document {}
