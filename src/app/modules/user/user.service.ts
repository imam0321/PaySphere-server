import { QueryBuilder } from "../../utils/QueryBuilder";
import { UserSearchableFields } from "./user.constant";
import { Role } from "./user.interface";
import { User } from "./user.model";

const getAllUser = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(
    User.find({ role: Role.user }).select("-password"),
    query
  );

  const users = queryBuilder
    .search(UserSearchableFields)
    .sort()
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

const getSingleUserOrAgent = async (id:string) => {
  return await User.findById(id).select("-password")
}

export const UserService = {
  getAllUser,
  getSingleUserOrAgent
};
