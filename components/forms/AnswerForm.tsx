"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { MDXEditorMethods } from "@mdxeditor/editor";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useRef, useState, useTransition } from "react";
import { AnswerSchema } from "@/lib/validations";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ReloadIcon } from "@radix-ui/react-icons";
import { createAnswer } from "@/lib/answer.action";
import { toast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";
import { title } from "process";

const Editor = dynamic(() => import("@/components/editor/index"), {
  ssr: false,
});

interface Props {
  questionId: string;
  questionTitle: string;
  questionContent: string;
}

const AnswerForm = ({ questionId, questionTitle, questionContent }: Props) => {
  const [isAnswering, startAnsweringTransition] = useTransition();
  const [isAiSubmitting, setIsAiSubmitting] = useState(false);
  const editorRef = useRef<MDXEditorMethods>(null);
  const session = useSession();

  const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: {
      content: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    startAnsweringTransition(async () => {
      const result = await createAnswer({
        questionId,
        content: values.content,
      });

      if (result.success) {
        form.reset();
        toast({
          title: "Success",
          description: "Answer submitted successfully.",
        });
        if (editorRef.current) {
          editorRef.current.setMarkdown("");
        }
      } else {
        toast({
          title: `Error ${result.status}`,
          description: result.error?.message,
          variant: "destructive",
        });
      }
    });
  });

  const generateAIAnswers = async () => {
    if (session.status !== "authenticated") {
      return toast({
        title: "Please login",
        description: "You must be logged in to generate AI answers",
      });
    }

    setIsAiSubmitting(true);

    const userAnswer = editorRef.current?.getMarkdown();

    try {
      const { success, data, error } = await api.ai.getAnswers(
        questionTitle,
        questionContent,
        userAnswer
      );

      if (!success) {
        return toast({
          title: `Error ${error.status}`,
          description: error.message,
          variant: "destructive",
        });
      }
      const formattedAnswer = data.replace(/<br>/g, " ").toString().trim();

      if (editorRef.current) {
        editorRef.current.setMarkdown(formattedAnswer);

        form.setValue("content", formattedAnswer);
        form.trigger("content");
      }

      toast({
        title: "Success",
        description: "AI answer generated successfully.",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An error occurred while generating AI answers";

      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsAiSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex   flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <h4 className="paragraph-semibold text-dark400_light800">
          Write your answer here
        </h4>
        <Button
          className="btn light-border-2 gap-1.5 rounded-md border px-4 py-2.5 text-primary-500 shadow-none dark:text-primary-500"
          disabled={isAiSubmitting}
          onClick={generateAIAnswers}
        >
          {isAiSubmitting ? (
            <>
              <ReloadIcon className="mr-2 size-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Image
                src="/icons/stars.svg"
                width={12}
                height={12}
                alt="Generate AI answer"
                className="object-contain"
              />{" "}
              Generate AI answer
            </>
          )}
        </Button>
      </div>
      <Form {...form}>
        <form
          onSubmit={handleSubmit}
          className="mt-6 flex w-full flex-col gap-10"
        >
          <Controller
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-3 min-h-[300px]">
                <FormControl className="mt-3.5 min-h-[300px]">
                  <Editor
                    value={field.value}
                    editorRef={editorRef}
                    fieldChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" className="primary-gradient w-fit">
              {isAnswering ? (
                <>
                  <ReloadIcon className="mr-2 size-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Answer"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AnswerForm;
