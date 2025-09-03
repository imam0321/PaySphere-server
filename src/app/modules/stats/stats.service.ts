import mongoose from "mongoose";
import AppError from "../../errorHelpers/AppError";
import { sevenDaysAgo, thirtyDaysAgo } from "../../utils/formatDate";
import { Transaction } from "../transaction/transaction.model";
import { User } from "../user/user.model";
import httpStatus from "http-status-codes";

const calculateTotal = async (transactionIds: mongoose.Types.ObjectId[], startDate: Date) => {
  const result = await Transaction.aggregate([
    {
      $match: {
        _id: { $in: transactionIds },
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  return result.length > 0 ? result[0].totalAmount : 0;
};

const getTransactionStats = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (
    !user.transactionId ||
    !Array.isArray(user.transactionId) ||
    user.transactionId.length === 0
  ) {
    throw new AppError(httpStatus.NOT_FOUND, "No transactions found for this user");
  }

  const transactionIds = user.transactionId.map((id: any) =>
    new mongoose.Types.ObjectId(id)
  );

  const [last7Days, last30Days] = await Promise.all([
    calculateTotal(transactionIds, sevenDaysAgo),
    calculateTotal(transactionIds, thirtyDaysAgo),
  ]);

  return {
    last7Days,
    last30Days,
  };
};

const getTransactionSummary = async () => {
  const result = await Transaction.aggregate([
    {
      $group: {
        _id: null,
        totalFee: { $sum: "$fee" },

        totalAddMoney: {
          $sum: {
            $cond: [{ $eq: ["$type", "add_money"] }, "$amount", 0],
          },
        },

        totalSendMoney: {
          $sum: {
            $cond: [{ $eq: ["$type", "send_money"] }, "$amount", 0],
          },
        },

        totalReceiveMoney: {
          $sum: {
            $cond: [{ $eq: ["$type", "receive_money"] }, "$amount", 0],
          },
        },

        totalCashIn: {
          $sum: {
            $cond: [{ $eq: ["$type", "cash_in"] }, "$amount", 0],
          },
        },

        totalCashOut: {
          $sum: {
            $cond: [{ $eq: ["$type", "cash_out"] }, "$amount", 0],
          },
        },

        totalWithdraw: {
          $sum: {
            $cond: [{ $eq: ["$type", "withdraw"] }, "$amount", 0],
          },
        },
      },
    },
  ]);

  return result[0];
};


export const StatsService = {
  getTransactionStats,
  getTransactionSummary
};
