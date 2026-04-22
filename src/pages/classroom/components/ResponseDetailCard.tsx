import type { PublicResponse } from "../../../types/publicApi";

type ResponseDetailCardProps = {
  response: PublicResponse;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function getCardTitle(response: PublicResponse) {
  if (response.node_title?.trim()) {
    return response.node_title;
  }

  return `Node ${response.node_id}`;
}

function getStudentResponseText(response: PublicResponse) {
  if (response.node_type === "free_response") {
    return response.answer_text?.trim() || "No written response saved.";
  }

  if (response.node_type === "choice") {
    return (
      response.selected_choice_label ??
      response.selected_choice_id ??
      "No selected choice saved."
    );
  }

  return null;
}

function ResponseDetailCard({ response }: ResponseDetailCardProps) {
  const studentResponseText = getStudentResponseText(response);
  const showFeedback =
    response.node_type === "free_response" && Boolean(response.feedback?.trim());

  return (
    <article className="rounded-2xl border border-neutral-300 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950/40">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-neutral-950 dark:text-neutral-50">
            {getCardTitle(response)}
          </h3>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
            Saved {formatDate(response.created_at)}
          </p>
        </div>
      </div>

      {response.prompt_text ? (
        <section className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
            Prompt
          </p>
          <div className="mt-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
            <p className="whitespace-pre-wrap text-sm text-neutral-900 dark:text-neutral-100">
              {response.prompt_text}
            </p>
          </div>
        </section>
      ) : null}

      {studentResponseText ? (
        <section className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
            Student Response
          </p>
          <div className="mt-2 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-500/20 dark:bg-cyan-500/10">
            <p className="whitespace-pre-wrap text-sm text-neutral-900 dark:text-neutral-100">
              {studentResponseText}
            </p>
          </div>
        </section>
      ) : null}

      {showFeedback ? (
        <section className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
            Feedback
          </p>
          <div className="mt-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
            <p className="whitespace-pre-wrap text-sm text-neutral-900 dark:text-neutral-100">
              {response.feedback}
            </p>
          </div>
        </section>
      ) : null}

      {typeof response.response_payload !== "undefined" ? (
        <details className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
          <summary className="cursor-pointer text-sm font-medium text-neutral-800 dark:text-neutral-200">
            View technical payload
          </summary>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-white p-3 text-xs text-neutral-800 dark:bg-neutral-950 dark:text-neutral-200">
            {JSON.stringify(response.response_payload, null, 2)}
          </pre>
        </details>
      ) : null}
    </article>
  );
}

export default ResponseDetailCard;
