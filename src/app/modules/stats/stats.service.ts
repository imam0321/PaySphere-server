import AppError from "../../errorHelpers/AppError";
import { sevenDaysAgo, thirtyDaysAgo } from "../../utils/formatDate";
import { Transaction } from "../transaction/transaction.model";
import { User } from "../user/user.model";
import httpStatus from "http-status-codes";

const getTransactionStats = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!user.transactionId || !Array.isArray(user.transactionId) || user.transactionId.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, "Transaction Not Found");
  }

  console.log(user.transactionId, sevenDaysAgo, thirtyDaysAgo)

  const [last7Days, last30Days] = await Promise.all([
    Transaction.aggregate([
      { $match: { _id: { $in: user.transactionId }, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: null, totalAmount: { $sum: "$amount" }, transactions: {
            $push: {
              _id: "$_id",
              type: "$type",
              amount: "$amount",
              createdAt: "$createdAt",
              fromWalletId: "$fromWalletId"
            }
          }
        }
      }
    ]),
    Transaction.aggregate([
      { $match: { _id: { $in: user.transactionId }, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: null, totalAmount: { $sum: "$amount" }, transactions: {
            $push: {
              _id: "$_id",
              type: "$type",
              amount: "$amount",
              createdAt: "$createdAt",
              fromWalletId: "$fromWalletId"
            }
          }
        }
      }
    ])
  ]);

  return {
    last7Days,
    last30Days,
  };



};

export const StatsService = {
  getTransactionStats,
};