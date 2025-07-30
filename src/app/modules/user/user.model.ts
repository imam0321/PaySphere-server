import { model, Schema } from "mongoose";
import { IAuthProvider, IsActive, IUser, Role } from "./user.interface";

const authProviderSchema = new Schema<IAuthProvider>(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
  },
  { versionKey: false, _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: Object.values(Role), default: Role.user },
    password: { type: String },
    phone: { type: String },
    picture: { type: String },
    address: { type: String },
    isActive: {
      type: String,
      enum: Object.values(IsActive),
      default: IsActive.active,
    },
    isVerified: { type: Boolean, default: false },
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet" },
    transactionId: [{ type: Schema.Types.ObjectId, ref: "Transaction" }],
    isApproved: { type: Boolean, default: false },
    commissionRate: { type: Number },
    auths: [authProviderSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User = model<IUser>("User", userSchema);
