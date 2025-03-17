import { getQuestion } from "@/lib/actions/question.action";
import React from "react";

const QuestionDetails = async ({ params }: RouteParams) => {
  const { id } = await params;
  const data = await getQuestion({ questionId: id });

  return <div>question page {id}</div>;
};

export default QuestionDetails;
