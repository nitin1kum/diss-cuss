import axios, { AxiosError, isAxiosError } from "axios";
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
  PrismaClientInitializationError,
  PrismaClientRustPanicError,
} from "@prisma/client/runtime/library";

import { ZodError } from "zod";

export function handleError(error: unknown, message: string): string {
  if (isAxiosError(error)) {
    console.error(message, "AxiosError:", {
      status: error.response?.status,
      message: error.message,
      stack: error.stack,
    });

    return `Axios error: ${error.response?.status || "Unknown status"} - ${error.message}`;
  }

  if (error instanceof PrismaClientKnownRequestError) {
    console.error(message, "Prisma Known Request Error:", {
      code: error.code,
      message: error.message,
      stack: error.stack,
    });

    return `Database error [${error.code}]: ${error.message}`;
  }

  if (error instanceof PrismaClientUnknownRequestError) {
    console.error(message, "Prisma Unknown Request Error:", error);
    return "Unknown database error occurred.";
  }

  if (error instanceof PrismaClientValidationError) {
    console.error(message, "Prisma Validation Error:", error);
    return "Database validation error: Check input data.";
  }

  if (error instanceof PrismaClientInitializationError) {
    console.error(message, "Prisma Initialization Error:", error);
    return "Database initialization failed.";
  }

  if (error instanceof PrismaClientRustPanicError) {
    console.error(message, "Prisma Rust Panic Error:", error);
    return "Critical database error occurred.";
  }

  if (error instanceof ZodError) {
    console.error(message, "Zod Validation Error:", error.flatten());
    return "Validation error: Invalid input format.";
  }

  if (error instanceof Error) {
    console.error(message, "Generic Error:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    return `Unexpected error: ${error.message}`;
  }

  console.error(message, "Unknown error type:", error);
  return "An unknown error occurred.";
}
