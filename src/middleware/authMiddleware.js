import { verifyAccessToken } from "../utils/jwtUtil.js";
import { userExistsInDb } from "../utils/userExistsInDbUtil.js";

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  try {
    const decoded = verifyAccessToken(token);

    const userIdInToken = decoded.userId;

    const userExists = await userExistsInDb({ id: userIdInToken });
    if (!userExists) {
      return res.status(401).json({ message: "User does not exist." });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};
