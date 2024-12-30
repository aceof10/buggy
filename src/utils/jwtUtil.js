import jwt from "jsonwebtoken";

const handleJWTVerification = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    const err = new Error();
    switch (error.name) {
      case "TokenExpiredError":
        err.message = "Session expired. Please log in again.";
        err.status = 401;
        break;
      case "JsonWebTokenError":
        err.message = "Invalid session. Please log in again.";
        err.status = 401;
        break;
      default:
        err.message = "Internal server error.";
        err.status = 500;
    }
    throw err;
  }
};

export const generateAccessToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

export const verifyAccessToken = (token) => {
  return handleJWTVerification(token, process.env.JWT_ACCESS_SECRET);
};

export const verifyRefreshToken = (token) => {
  return handleJWTVerification(token, process.env.JWT_REFRESH_SECRET);
};
