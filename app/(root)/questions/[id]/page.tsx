import TagCard from "@/components/cards/TagCard";
import Preview from "@/components/editor/Preview";
import AnswerForm from "@/components/forms/AnswerForm";
import Metric from "@/components/Metric";
import UserAvatar from "@/components/UserAvatar";
import ROUTES from "@/constants/routes";
import { getQuestion, incrementViews } from "@/lib/actions/question.action";
import { formatNumber, getTimeStamp } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import { after } from "next/server";
import React from "react";

const QuestionDetails = async ({ params }: RouteParams) => {
  const { id } = await params;
  const { success, data: question } = await getQuestion({ questionId: id });

  after(async () => {
    await incrementViews({ questionId: id });
  });

  // TODO:Approach 1
  // const [_, { success, data: question }] = await Promise.all([
  //   await incrementViews({ questionId: id }),
  // await getQuestion({ questionId: id });
  // ]);

  if (!success || !question) return redirect("/404");

  const { author, createdAt, views, tags, answers, title, content } = question;

  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between">
          <div className="flex items-center justify-start gap-1">
            <UserAvatar
              id={author._id}
              name={author.name}
              className="size-[22px]"
              fallbackClassName="text-[10px]"
            />
            <Link href={ROUTES.PROFILE(author._id)}>
              <p className="paragraph-semibold text-dark300_light700">
                {author.name}
              </p>
            </Link>
          </div>
          <div className="flex justify-end">
            <p>Votes</p>
          </div>
        </div>
        <h2 className="h2-semibold text-dark200-light900 mt-3.5 w-full">
          {title}
        </h2>
      </div>
      <div className="mb-8 mt-5 flex flex-wrap gap-4">
        <Metric
          imgUrl="/icons/clock.svg"
          alt="clock icon"
          title=""
          textStyles="small-regular text-dark400_light700"
          value={`asked ${getTimeStamp(new Date(createdAt))}`}
        />
        <Metric
          imgUrl="/icons/message.svg"
          alt="message icon"
          title=""
          textStyles="small-regular text-dark400_light700"
          value={answers}
        />
        <Metric
          imgUrl="/icons/eye.svg"
          alt="eye icon"
          title=""
          textStyles="small-regular text-dark400_light700"
          value={formatNumber(views)}
        />
      </div>
      <Preview content={content} />

      <div className="mt-8 flex flex-wrap gap-2">
        {tags.map((tag: Tag) => (
          <TagCard key={tag._id} _id={tag._id} name={tag.name} compact />
        ))}
      </div>
      <section className="my-5">
        <AnswerForm questionId={question._id} />
      </section>
    </>
  );
};

export default QuestionDetails;
