"use server";

import { ZodError, ZodSchema } from "zod";
import { UnauthorizedError, ValidationError } from "../http-error";
import { Session } from "next-auth";
import { auth } from "@/auth";
import dbConnect from "../mongoose";

type ActionOptions<T> = {
  params?: T;
  schema?: ZodSchema<T>;
  authorize?: boolean;
};

async function action<T>({
  params,
  schema,
  authorize = false,
}: ActionOptions<T>) {
  if (schema && params) {
    try {
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError(
          error.flatten().fieldErrors as Record<string, string[]>
        );
      } else {
        throw new Error("Schema validation failed");
      }
    }
  }

  let session: Session | null = null;

  if (authorize) {
    session = await auth();

    if (!session) {
      return new UnauthorizedError();
    }
  }

  await dbConnect();

  return { params, session };
}

export default action;
