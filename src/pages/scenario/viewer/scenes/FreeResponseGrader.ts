import {
  publicApiPost,
  resolvePublicApiToken,
} from '../../../../lib/public-api-client';
import type {FreeResponseNode} from '../../nodeSchemas';

export type FreeResponseEvaluation = {
  bucket_id: string,
  feedback?: string
};

export type FreeResponseEvaluationResult =
  | { ok: true; evaluation: FreeResponseEvaluation }
  | { ok: false; error: string };

export const evaluateFreeResponse = async(
    node: FreeResponseNode,
    userText: string): Promise<FreeResponseEvaluationResult> => {
  const rubric = node.rubric;

  try {
    const token = await resolvePublicApiToken();
    if (!token) {
      throw new Error('You must be logged in to grade free responses.');
    }

    const json = await publicApiPost<FreeResponseEvaluation>(
      '/api/public/grade',
      token,
      {
        question_prompt: node.prompt,
        user_response_text: userText,
        rubric,
      },
    );

    return {ok: true, evaluation: json};
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return {ok: false, error: message};
  }
};
