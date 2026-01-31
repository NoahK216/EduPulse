export interface GradeResponse {
  bucket_id: string;
  feedback: string;
}

export interface GradeRequestBody {
  question_prompt: string;
  user_response_text: string;
  rubric: {
    version?: number;
    context?: string;
    answerBuckets: {
      id: string; // unique to rubric
      classifier: string;
      toNode?: string;
    }[];
  };
}
