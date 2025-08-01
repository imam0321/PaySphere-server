import { QueryBuilder } from "../../utils/QueryBuilder";
import { UserSearchableFields } from "../user/user.constant";
import { Role } from "../user/user.interface";
import { User } from "../user/user.model";

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


export const AgentService = {
  getAllAgent,
};
