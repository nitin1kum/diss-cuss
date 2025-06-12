import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../types/types";
import { handleError } from "../utils/handleError";
import { cookieConfig } from "../controllers/authController";
import { prisma } from "../lib/prisma";
import { generateTokens } from "../utils/generateTokens";
import { logger } from "../utils/logger";

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) : Promise<any> => {
  logger.info("Authentication started")
  const accessToken = req.signedCookies?.accessToken;
  const refreshToken = req.signedCookies?.refreshToken;

  if (accessToken) {
    try {
      const user = jwt.verify(accessToken, process.env.JWT_SECRET!) as any;
      req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
      };
      return next();
    } catch (error) {
      res.clearCookie("accessToken", cookieConfig());
      handleError(error, "Invalid access token - falling back to refresh");
    }
  }

  if (refreshToken) {
    try {
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: `${refreshToken}` },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        return next();
      }

      const user = await prisma.user.findUnique({
        where: { id: storedToken.user_id },
      });

      if (!user) return next();

      if (storedToken.usedAt) {
        if (
          new Date().getMilliseconds() - storedToken.usedAt.getMilliseconds() >
          5000
        ) {
          await prisma.refreshToken.deleteMany({
            where: { user_id: storedToken.user_id },
          });

          res.clearCookie("accessToken", cookieConfig());
          res.clearCookie("refreshToken", cookieConfig());

          logger.warn("Token reuse detected");
          return res
            .status(401)
            .json({ error: "Token reuse detected. Logged out for safety." });
        }

        req.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
        };
        return next();
      }

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await generateTokens(user);

      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { usedAt: new Date() },
      });

      res.cookie("accessToken", newAccessToken, cookieConfig(5 * 60 * 1000));
      res.cookie(
        "refreshToken",
        newRefreshToken,
        cookieConfig(7 * 24 * 60 * 60 * 1000)
      );

      // wip remove access data from req
      req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
      };
    } catch (error) {
      handleError(error, "Error authenticating with refresh token");
    }
  }

  return next();
};
