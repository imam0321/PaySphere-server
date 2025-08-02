import { User } from "./user.model";



const getMe = async (userId: string) => {
  const myInfo = await User.findById(userId)
    .select("-password")
    .populate("walletId", "balance status");
  return {
    data: myInfo,
  };
};



export const UserService = {
  getMe,
};
