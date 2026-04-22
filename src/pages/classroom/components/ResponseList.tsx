import type { PublicResponse } from "../../../types/publicApi";
import ResponseDetailCard from "./ResponseDetailCard";

type ResponseListProps = {
  responses: PublicResponse[];
};

function ResponseList({ responses }: ResponseListProps) {
  return (
    <div className="mt-3 space-y-4">
      {responses.map((response) => (
        <ResponseDetailCard key={response.id} response={response} />
      ))}
    </div>
  );
}

export default ResponseList;
