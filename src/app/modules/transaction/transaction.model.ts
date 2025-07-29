import { Schema, model } from "mongoose";
import { ITransaction, TransactionType } from "./transaction.interface";

const transactionSchema = new Schema<ITransaction>(
  {
    fromWalletId: { type: Schema.Types.ObjectId, ref: "Wallet" },
    toWalletId: { type: Schema.Types.ObjectId, ref: "Wallet" },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    amount: { type: Number, required: true },
    fee: { type: Number },
    commission: { type: Number },
    currentBalance: { type: Number, required: true },
    initiatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const TransactionModel = model<ITransaction>(
  "Transaction",
  transactionSchema
);
