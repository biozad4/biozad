import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "manager" | "cashier" | "customer";
    } & DefaultSession["user"];
  }

  interface User {
    role?: "admin" | "manager" | "cashier" | "customer";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "admin" | "manager" | "cashier" | "customer";
  }
}