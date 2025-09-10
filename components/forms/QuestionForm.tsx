"use client";

import React, { useRef, useTransition } from "react";
import { AskQuestionSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ReloadIcon } from "@radix-ui/react-icons";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import TagCard from "../cards/TagCard";
import { number, z } from "zod";
import dynamic from "next/dynamic";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { createQuestion, editQuestion } from "@/lib/actions/question.action";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import ROUTES from "@/constants/routes";
const Editor = dynamic(() => import("@/components/editor"), {
  ssr: false,
});

interface Props {
  question?: Question;
  isEdit?: boolean;
}
const QuestionForm = ({ question, isEdit = false }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof AskQuestionSchema>>({
    resolver: zodResolver(AskQuestionSchema),
    defaultValues: {
      title: question?.title || "",
      content: question?.content || "",
      tags: question?.tags.map((tag) => tag.name) || [],
    },
  });

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: { value: string[] }
  ) => {
    const tagInput = e.currentTarget.value.trim();

    if (e.key === "Enter") {
      e.preventDefault();

      if (tagInput && tagInput.length < 15 && !field.value.includes(tagInput)) {
        form.setValue("tags", [...field.value, tagInput]);
        e.currentTarget.value = "";
        form.clearErrors("tags");
      } else if (tagInput.length > 15) {
        form.setError("tags", {
          type: "manual",
          message: "Tag should be less than 15 characters",
        });
      }
    } else if (field.value.includes(tagInput)) {
      form.setError("tags", {
        type: "manual",
        message: "Tag already exist",
      });
    }
  };

  const handleTagRemove = (tag: string, field: { value: string[] }) => {
    const newTags = field.value.filter((t) => t !== tag);

    form.setValue("tags", newTags);

    if (newTags.length === 0) {
      form.setError("tags", {
        type: "manual",
        message: "Tag are required",
      });
    }
  };
  const editorRef = useRef<MDXEditorMethods>(null);

  const handleCreateQuestion = async (
    data: z.infer<typeof AskQuestionSchema>
  ) => {
    startTransition(async () => {
      if (isEdit && question) {
        const result = await editQuestion({
          questionId: question._id,
          ...data,
        });
        if (result.success) {
          toast({
            title: "Success",
            description: "Question updated successfully.",
          });

          if (result.data) router.push(ROUTES.QUESTION(result.data?._id));
        } else {
          toast({
            title: `Error ${result.status}`,
            description: result.error?.message || "Something went wrong",
            variant: "destructive",
          });
        }
        return;
      }
      const result = await createQuestion(data);

      if (result.success) {
        toast({
          title: "Success",
          description: "Question created successfully.",
        });

        if (result.data) router.push(ROUTES.QUESTION(result.data?._id));
      } else {
        toast({
          title: `Error ${result.status}`,
          description: result.error?.message || "Something went wrong",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form
        className="gap-10 flex w-full flex-col"
        onSubmit={form.handleSubmit(handleCreateQuestion)}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel className="paragraph-semibold text-dark400_light800">
                Question title <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="paragraph-regular background-light700_dark300 light-border-2 
                    text-dark300_light700 no-focus min-h-[56px]  border"
                  {...field}
                />
              </FormControl>
              <FormDescription className="body-regular text-light-500 mt-2.5">
                Be specific and imagine you’re asking a question to another
                person.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel className="paragraph-semibold text-dark400_light800">
                Detailed explanation of your problem?
                <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl>
                <Editor
                  fieldChange={field.onChange}
                  value={field.value}
                  editorRef={editorRef}
                />
              </FormControl>
              <FormDescription className="body-regular text-light-500 mt-2.5">
                Introduce the problem and expand on what you put in the title.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="paragraph-semibold text-dark400_light800">
                Tags <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl>
                <div>
                  <Input
                    placeholder="Add tags..."
                    type="text"
                    className="paragraph-regular background-light700_dark300 light-border-2 
                  text-dark300_light700 no-focus min-h-[56px]  border"
                    onKeyDown={(e) => handleInputKeyDown(e, field)}
                  />
                  {field.value.length > 0 && (
                    <div className="flex-start mt-2.5 flex-wrap gap-2.5">
                      {field.value.map((tag: string, index: number) => (
                        <TagCard
                          key={index}
                          _id={tag}
                          name={tag}
                          compact
                          remove
                          isButton
                          handleRemove={() => handleTagRemove(tag, field)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription className="body-regular text-light-500 mt-2.5">
                Add up to 5 tags to describe what your question is about. Start
                typing to see suggestions.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="mt-16 flex justify-end">
          <Button
            className="primary-gradient !text-light-900 w-fit"
            type="submit"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <ReloadIcon className="mr-2 size-4 animate-spin" />
                <span>Submitting</span>
              </>
            ) : (
              <>{isEdit ? "Edit:" : "Ask a Question"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default QuestionForm;
