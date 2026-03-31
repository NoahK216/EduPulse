import type { PublicResponse } from '../../../types/publicApi';

type ResponseDetailCardProps = {
  response: PublicResponse;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function ResponseDetailCard({ response }: ResponseDetailCardProps) {
  return (
    <section className="rounded-md border border-neutral-800 bg-neutral-800 p-4">
      <h2 className="text-xl font-semibold">Node: {response.node_id}</h2>
      <p className="mt-1 text-sm text-neutral-300">
        Created: {formatDate(response.created_at)}
      </p>
      <p className="mt-1 text-sm text-neutral-300">
        Student: {response.student_name}
      </p>
      <p className="mt-3 text-sm text-neutral-200">
        Feedback: {response.feedback ?? 'No feedback'}
      </p>

      {typeof response.response_payload !== 'undefined' ? (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold text-neutral-200">Payload</h3>
          <pre className="overflow-x-auto rounded bg-neutral-900 p-3 text-xs text-neutral-200">
            {JSON.stringify(response.response_payload, null, 2)}
          </pre>
        </div>
      ) : null}
    </section>
  );
}

export default ResponseDetailCard;
