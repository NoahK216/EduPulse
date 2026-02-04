import type {FreeResponseNode} from '../scenarioNodeSchemas';

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
    const res = await fetch('/api/grade', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        question_prompt: node.prompt,
        user_response_text: userText,
        rubric,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Server error (${res.status}): ${text}`);
    }

    const json = (await res.json()) as FreeResponseEvaluation;

    return {ok: true, evaluation: json};
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return {ok: false, error: message};
  }
};
