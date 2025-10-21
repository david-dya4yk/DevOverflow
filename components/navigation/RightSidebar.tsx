import ROUTES from '@/constants/routes';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { getHotQuestion } from '@/lib/actions/question.action';
import DataRenderer from '@/components/DataRenderer';
import { getTopTags } from '@/lib/actions/tag.action';
import TagCard from '@/components/cards/TagCard';

const RightSidebar = async () => {
  const [
    { success, data: hotQuestions, error },
    { success: tagSuccess, data: tags, error: tagError },
  ] = await Promise.all([getHotQuestion(), getTopTags()]);

  return (
    <section className="pt-36 custom-scrollbar background-light900_dark200 light-border sticky right-0 top-0 flex h-screen w-[350px] flex-col gap-6 overflow-y-auto border-l p-6 shadow-light-300 dark:shadow-none max-xl:hidden">
      <div className=" ">
        <h3 className="h3-bold text-dark200-light900">Hot Network</h3>

        <DataRenderer
          data={hotQuestions}
          success={success}
          error={error}
          empty={{
            title: 'No questions found.',
            message: 'no have been question yet.',
          }}
          render={hotQuestions => {
            return (
              <div className="mt-7 flex w-full flex-col gap-[30px] mb-7">
                {hotQuestions.map(({ _id, title }) => (
                  <Link
                    key={_id}
                    className="flex cursor-pointer items-center justify-between gap-7 "
                    href={ROUTES.QUESTION(_id)}
                  >
                    <p className="body-medium text-dark500_light700 line-clamp-2">
                      {title}
                    </p>
                    <Image
                      src="/icons/chevron-right.svg"
                      width={20}
                      height={20}
                      alt="Chevron"
                      className="invert-colors"
                    />
                  </Link>
                ))}
              </div>
            );
          }}
        />

        <h3 className="h3-bold text-dark200-light900">Popular tags</h3>

        <DataRenderer
          data={tags}
          success={tagSuccess}
          error={tagError}
          empty={{
            title: 'No tags found.',
            message: 'No tags have been created.',
          }}
          render={tags => (
            <div className="mt-7 flex flex-col gap-4">
              {tags.map(({ _id, name, questions }) => (
                <TagCard
                  key={_id}
                  _id={_id}
                  questions={questions}
                  name={name}
                  showCount
                  compact
                />
              ))}
            </div>
          )}
        />
      </div>
    </section>
  );
};

export default RightSidebar;
