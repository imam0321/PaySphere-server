import { Schema, model } from "mongoose";
import { IWalletDocument, WalletStatus } from "./wallet.interface";

const walletSchema = new Schema<IWalletDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    balance: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ["BDT"], default: "BDT" },
    status: {
      type: String,
      enum: Object.values(WalletStatus),
      default: WalletStatus.active,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Wallet = model<IWalletDocument>("Wallet", walletSchema);
