import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    isVerified?: boolean;
    username?: string;
  }
  interface Session {
    user: {
      id: string;
      username?: string;
      isVerified?: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username?: string;
    isVerified?: boolean;
  }
}
