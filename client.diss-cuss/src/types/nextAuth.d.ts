import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    emailVerified?: boolean | Date | null | undefined;
    username?: string;
  }
  interface Session {
    user: {
      id: string;
      username?: string;
      emailVerified?: boolean | Date | null | undefined;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username?: string;
    emailVerified?: boolean | Date | null | undefined;
  }
}
