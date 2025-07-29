import { Types } from "mongoose";

export enum Role {
  admin = "admin",
  user = "user",
  agent = "agent",
}

export enum IsActive {
  active = "active",
  blocked = "blocked",
}

export interface IAuthProvider {
  provider: "Google" | "Credential";
  providerId: string;
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  role: Role;
  password?: string;
  phone?: string;
  picture?: string;
  address?: string;
  isActive?: IsActive;
  isVerified?: boolean;

  walletId?: Types.ObjectId; 
  isApproved?: boolean;
  commissionRate?: number;
  auths: IAuthProvider[];
}
