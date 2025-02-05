import { verifyAccessToken } from "../utils/jwtUtil.js";
import { userExistsInDb } from "../utils/userExistsInDbUtil.js";
import {
  HEADER_MALFORMED,
  UNAUTHORIZED,
  INTERNAL_SERVER_ERROR,
} from "../constants/constants.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: HEADER_MALFORMED });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      return res.status(err.status).json({ message: err.message }); // err is thrown in handleJWTVerification -> verifyAccessToken
    }

    const userIdInToken = decoded.userId;
    const userExists = await userExistsInDb({ id: userIdInToken });
    if (!userExists) {
      /*
      Valid token for non-existent user.
      Potential security issue because this would either mean
      JWT_ACCESS_SECRET is exposed hence can be used to generate JWTs that pass validation
      or user is deleted from database, thus need for invalidating their previous JWT token(s)
      */

      /*
      TODO
      - Log for investigation
      - Revoke existing tokens (to invalidate tokens for deleted users)
      - Trigger alerts to investigate possible key leaks
      */

      return res.status(401).json({ message: UNAUTHORIZED });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
};
