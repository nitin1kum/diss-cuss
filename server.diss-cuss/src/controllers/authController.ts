import "dotenv/config";
import { prisma } from "../lib/prisma";
import { Request, Response } from "express";
import {
  emailSchema,
  loginSchema,
  registrationSchema,
} from "../schemas/auth.schema";
import { handleError } from "../utils/handleError";
import { generateTokens } from "../utils/generateTokens";
import { AuthenticatedRequest } from "../types/types";
import { sendEmail } from "../utils/emailSender";
import { emailTemplate } from "../utils/emailTemplates";
import { decryptEmail, encryptEmail } from "../utils/emailEncryption";
import argon2 from "argon2";
import axios from "axios";

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI,
  NEXT_BASE_URL,
  BACKEND_BASE_URL,
} = process.env;

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

interface reqBodyRegistration {
  username: string;
  email: string;
  password: string;
}

interface reqBodyLogin {
  email: string;
  password: string;
}

interface reqQueryOauth {
  code : any
}

export function cookieConfig(expireAt?: number) {
  const config: any = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    // domain: process.env.COOKIE_DOMAIN,
    path: "/",
    signed: true,
  };

  if (expireAt) {
    config.maxAge = expireAt;
  }

  return config;
}

// user registration
export const registerUser = async (
  req: Request<any, any, reqBodyRegistration, any>,
  res: Response
): Promise<any> => {
  try {
    const parsed = registrationSchema.safeParse(req.body);
    if (parsed.error) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const { email, password, username } = parsed.data;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      if (!user.emailVerified) {
        const token = encryptEmail(user.email);
        const html = emailTemplate.replace(
          "{{VERIFY_URL}}",
          `${BACKEND_BASE_URL}/api/auth/verify/${token}`
        );
        await sendEmail(user.email, "Email Verification", html);
        return res.status(200).json({ message: "Verification email resent" });
      } else {
        return res.status(400).json({ message: "User already exists" });
      }
    }

    if (user) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPwd = await argon2.hash(password);

    const newUser = await prisma.user.create({
      data: { username, email, password: hashedPwd },
    });

    if (newUser) {
      const token = encryptEmail(newUser.email);
      const html = emailTemplate.replace(
        "{{VERIFY_URL}}",
        `${process.env.NEXT_BACKEND_URL}/api/auth/verify/${token}`
      );
      await sendEmail(newUser.email, "Email Verification", html);
      return res.status(201).json({
        message: "User registered successfully",
      });
    }

    return res.status(400).json({
      message: "Some unknown error occurred",
    });
  } catch (error) {
    const message = handleError(error, "Error registering user - ");
    res.status(500).json({ message });
  }
};

// user login
export const loginUser = async (
  req: Request<any, any, reqBodyLogin, any>,
  res: Response
): Promise<any> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (parsed.error) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "This account is attached with google login.",
      });
    }

    // user valid or not
    const isValidPassword = await argon2.verify(user.password, password);
    if (!isValidPassword) {
      return res.status(400).json({
        message: "Wrong Password",
      });
    }

    if (!user.emailVerified) {
      return res.status(400).json({
        message: `Please verify your account before login. <a href="${NEXT_BASE_URL}/auth/verify/generate">Verify</a>`,
      });
    }

    const { accessToken, refreshToken } = await generateTokens(user);
    res.cookie("accessToken", accessToken, cookieConfig(5 * 60 * 1000));
    res.cookie(
      "refreshToken",
      refreshToken,
      cookieConfig(7 * 24 * 60 * 60 * 1000)
    );
    return res.status(201).json({
      message: "User loggedIn successfully",
    });
  } catch (error) {
    const message = handleError(error, "Error login user - ");
    res.status(500).json({ message });
  }
};

// authenticate user
export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const user = req.user;
    if (user) {
      return res.status(200).json({
        message: "User is authenticated",
        user,
      });
    }
    return res.status(200).json({
      message: "User is not authenticated",
    });
  } catch (error) {
    const message = handleError(error, "Error authenticate user - ");
    res.status(500).json({ message });
  }
};

//logout
export const logoutUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { refreshToken } = req.signedCookies;
    if (!refreshToken) {
      return res.status(404).json({
        message: "Refresh token not found",
      });
    }

    await prisma.refreshToken.delete({
      where: { token: refreshToken },
    });
    res.clearCookie("accessToken", cookieConfig());
    res.clearCookie("refreshToken", cookieConfig());

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    const message = handleError(error, "Error logging out user - ");
    res.status(500).json({ message });
  }
};

// verify email
export async function verifyEmail(req: Request, res: Response): Promise<any> {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: "Token is missing" });
    }

    let email: string;
    try {
      email = decryptEmail(token);
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(200).json({ message: "Email already verified" });
    }

    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    const message = handleError(error, "Error verifying email - ");
    return res.status(500).json({ message });
  }
}

// resend email
export async function resendEmail(req: Request, res: Response): Promise<any> {
  try {
    const parsed = emailSchema.safeParse(req.body);

    if (parsed.error) {
      return res.status(400).json({ error: parsed.error.flatten });
    }
    const { email } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "Email not registered." });
    }

    const token = encryptEmail(user.email);
    const html = emailTemplate.replace(
      "{{VERIFY_URL}}",
      `${BACKEND_BASE_URL}/api/auth/verify/${token}`
    );
    await sendEmail(email, "Email Verification", html);

    return res.json({ message: "Verificatio link send" });
  } catch (error: any) {
    const message = handleError(error, "Error logging out user - ");
    res.status(500).json({ message });
  }
}

// oauth login
export async function oauthLogin(req: Request, res: Response): Promise<any> {
  const authUrl = `${GOOGLE_AUTH_URL}?response_type=code&client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    process.env.REDIRECT_URI!
  )}&scope=openid%20email%20profile&access_type=offline&prompt=consent`;
  res.redirect(authUrl);
}

// oauth callback
export async function oauthCallback(req: Request<any,any,any,reqQueryOauth>, res: Response): Promise<any> {
  try {
    const { code } = req.query;
    if (!code) throw new Error("Missing code");

    const tokenRes = await axios.post(GOOGLE_TOKEN_URL, null, {
      params: {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const { access_token } = tokenRes.data;

    const userInfoRes = await axios.get(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const user = userInfoRes.data;

    if (!user) {
      throw new Error("Did not get any user.");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (existingUser) {
      const { accessToken, refreshToken } = await generateTokens(existingUser);
      res.cookie("accessToken", accessToken, cookieConfig(5 * 60 * 1000));
      res.cookie(
        "refreshToken",
        refreshToken,
        cookieConfig(7 * 24 * 60 * 60 * 1000)
      );
    } else {
      const newUser = await prisma.user.create({
        data: {
          name: user.name,
          username: user.name,
          email: user.email,
          image: user.picture,
          emailVerified: new Date(),
        },
      });
      const { accessToken, refreshToken } = await generateTokens(newUser);
      res.cookie("accessToken", accessToken, cookieConfig(5 * 60 * 1000));
      res.cookie(
        "refreshToken",
        refreshToken,
        cookieConfig(7 * 24 * 60 * 60 * 1000)
      );
    }

    res.redirect(`${NEXT_BASE_URL}`);
  } catch (err) {
    const message = handleError(err,"Error during oauth - ")
    res.redirect(`${NEXT_BASE_URL}/auth/login?error=${message}`);
  }
}
