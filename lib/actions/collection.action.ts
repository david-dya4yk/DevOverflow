"use server"

import action from "@/lib/handlers/action";
import {CollectionBase} from "@/lib/validations";
import handleError from "../handlers/error";
import {Collection, Question} from "@/database";
import {revalidatePath} from "next/cache";
import ROUTES from "@/constants/routes";

export async function toggleSaveQuestion(params: CollectionBaseParams): Promise<ActionResponse<{ saved: boolean }>> {
  const validationResult = await action({
    params,
    schema: CollectionBase,
    authorize: true,
  })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse
  }

  const {questionId} = validationResult.params!;
  const userid = validationResult.session?.user?.id

  try {
    const question = await Question.findById(questionId);
    if(!question) throw new Error(`Question not found.`);

    const collection = await Collection.findOne({
      question: questionId,
      author: userid,
    });

    if(collection ) {
      await Collection.findOneAndDelete(collection.id)

      return {
        success: true,
        data: {
          saved: false
        },
      }
    }

    await Collection.create({
      question: questionId,
      author: userid,
    })

    revalidatePath(ROUTES.QUESTION(questionId))

    return {
      success: true,
      data: {
        saved: true
      }
    }
  } catch (error) {
    return handleError(error) as ErrorResponse
  }

}