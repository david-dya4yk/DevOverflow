"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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

const Editor = dynamic(() => import("@/components/editor/index"), {
  ssr: false,
});

const AnswerForm = ({ questionId }: { questionId: string }) => {
  const [isAnswering, startAnsweringTransition] = useTransition();
  const [isAiSubmitting, setIsAiSubmitting] = useState(false);
  const editorRef = useRef<MDXEditorMethods>(null);

  const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: {
      content: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof AnswerSchema>) => {
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
      } else {
        toast({
          title: `Error ${result.status}`,
          description: result.error?.message,
          variant: "destructive",
        });
      }
      console.log("result", result);
    });
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
          onSubmit={form.handleSubmit(handleSubmit)}
          className="mt-6 flex w-full flex-col gap-10"
        >
          <FormField
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
