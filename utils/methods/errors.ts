import { AxiosError } from "axios";
import { ZodError } from "zod";

export function extractErrorMessage(error: unknown) {
  if (error instanceof AxiosError) return error.response?.data.error.message;
  if (error instanceof ZodError) return error.errors[0].message;
  if (error instanceof Error) return error.message;
  return "Oops, um erro não identificado ocorreu.";
}
