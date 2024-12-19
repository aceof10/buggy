import db from "../models/index.js";

export const userExistsInDb = async (identifier) => {
  const { email, id } = identifier;

  if (!email && !id) {
    throw new Error("Either email or user id must be provided.");
  }

  const whereClause = email ? { email } : { id };
  const user = await db.User.findOne({ where: whereClause });

  return !!user;
};
