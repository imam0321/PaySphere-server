import { QueryBuilder } from "../../utils/QueryBuilder";
import { UserSearchableFields } from "../user/user.constant";
import { Role } from "../user/user.interface";
import { User } from "../user/user.model";

const getAllUser = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(
    User.find({ role: Role.user }).select("-password"),
    query
  );

  const users = queryBuilder
    .search(UserSearchableFields)
    .sort()
    .fields()
    .filter()
    .paginate();

  const [data, meta] = await Promise.all([
    users.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const getAllAgent = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find({role: Role.agent}).select("-password"), query);
  
    const agents = queryBuilder
      .search(UserSearchableFields)
      .sort()
      .filter()
      .paginate();
  
    const [data, meta] = await Promise.all([
      agents.build(),
      queryBuilder.getMeta(),
    ]);
  
    return {
      data,
      meta,
    };
};

const getSingleUserOrAgent = async (phone: string) => {
  const userInfo = await User.findOne({ phone })
    .select("-password")
    .populate("walletId", "balance status");
  return {
    data: userInfo,
  };
};

export const AdminService = {
  getAllUser,
  getAllAgent,
  getSingleUserOrAgent,
};
