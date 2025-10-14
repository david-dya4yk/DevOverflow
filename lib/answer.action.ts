"use server";

import Answer, {IAnswerDoc} from "@/database/answer.module";
import {
  AnswerServerSchema,
  DeleteAnswerSchema,
  GetAnswersSchema
} from "./validations";
import action from "./handlers/action";
import handleError from "./handlers/error";
import mongoose from "mongoose";
import {revalidatePath} from "next/cache";
import ROUTES from "@/constants/routes";
import {Question, Vote} from "@/database";
import {createInteraction} from "@/lib/actions/interaction.action";
import { after } from 'next/server'

export async function createAnswer(
  params: CreateAnswerParams
): Promise<ActionResponse<IAnswerDoc>> {
  const validationResult = await action({
    params,
    schema: AnswerServerSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {content, questionId} = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const question = await Question.findById(questionId);
    if (!question) {
      throw new Error("Question not found");
    }

    const [newAnswer] = await Answer.create(
      [
        {
          author: userId,
          question: questionId,
          content,
        },
      ],
      {session}
    );

    if (!newAnswer) throw new Error("Failed to create answer");

    question.answers += 1;
    question.markModified("answers");

    await question.save({session});

    after(async () => {
      await createInteraction({
        action: "post",
        actionId: newAnswer._id.toString(),
        actionTarget: "answer",
        authorId: userId as string,
      });
    });

    await session.commitTransaction();

    revalidatePath(ROUTES.QUESTION(questionId));

    return {success: true, data: JSON.parse(JSON.stringify(newAnswer))};
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function getAnswers(params: GetAnswerParams): Promise<
  ActionResponse<{
    answers: Answers[];
    isNext: boolean;
    totalAnswers: number;
  }>
> {
  const validationResult = await action({
    params,
    schema: GetAnswersSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {questionId, page = 1, pageSize = 10, query, filter, sort} = params;

  const skip = (page - 1) * pageSize;

  let sortCriteria = {};
  switch (filter) {
    case "latest":
      sortCriteria = {createdAt: -1};
      break;
    case "oldest":
      sortCriteria = {createdAt: 1};
      break;
    case "popular":
      sortCriteria = {upvotes: 1};
      break;
    default:
      sortCriteria = {createdAt: -1};
      break;
  }

  try {
    const totalAnswers = await Answer.countDocuments({question: questionId});
    const answers = await Answer.find({question: questionId})
      .populate("author", "_id name image")
      .sort(sortCriteria)
      .skip(skip)
      .limit(pageSize);

    const isNext = totalAnswers > skip + answers.length;

    return {
      success: true,
      data: {
        answers: JSON.parse(JSON.stringify(answers)),
        isNext,
        totalAnswers,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteAnswer(params: DeleteAnswerParams): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: DeleteAnswerSchema,
    authorize: true,
  })

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {answerId} = validationResult.params!;
  const {user} = validationResult.session!

  try {
    const answer = await Answer.findById({_id: answerId});
    if (!answer) throw new Error("This answer does not exist.");
    if (user?.id !== answer.author.toString()) throw new Error("You are not authorized to delete this answer");

    await Question.findByIdAndUpdate(
      answer.question,
      { $inc: { answers: -1 } },
      { new: true }
    );

    await Vote.deleteMany({ actionId: answerId, actionType: "answer" });
    await Answer.findByIdAndDelete(answerId);

    revalidatePath(`/profile/${user?.id}`);

    return {success: true}
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}