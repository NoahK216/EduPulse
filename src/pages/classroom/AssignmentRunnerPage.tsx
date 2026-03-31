import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ApiRequestError, publicApiPost, resolvePublicApiToken } from "../../lib/public-api-client";
import { isUuid } from "../../lib/uuid";
import type {
  ItemResponse,
  PublicAssignmentAttemptSession,
  PublicAttempt,
} from "../../types/publicApi";
import {
  ErrorPanel,
  LoadingPanel,
  UnauthorizedPanel,
} from "../../components/data/DataStatePanels";
import PageShell from "../../components/layout/PageShell";
import { ScenarioSchema } from "../scenario/scenarioSchemas";
import ScenarioViewer from "../scenario/viewer/ScenarioViewer";

function AssignmentRunnerPage() {
  const navigate = useNavigate();
  const { classroomId, assignmentId } = useParams();
  const classroomIdValue = isUuid(classroomId) ? classroomId : null;
  const assignmentIdValue = isUuid(assignmentId) ? assignmentId : null;
  const hasValidIds = classroomIdValue !== null && assignmentIdValue !== null;

  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<PublicAssignmentAttemptSession | null>(null);
  const [attempt, setAttempt] = useState<PublicAttempt | null>(null);
  const parsedScenario = useMemo(() => {
    if (!session) {
      return null;
    }

    return ScenarioSchema.safeParse(session.scenario_content);
  }, [session]);

  useEffect(() => {
    let cancelled = false;

    if (!hasValidIds) {
      setLoading(false);
      setUnauthorized(false);
      setError("The classroom or assignment ID in the URL is invalid.");
      setSession(null);
      setAttempt(null);
      return () => {
        cancelled = true;
      };
    }

    const run = async () => {
      setLoading(true);
      setUnauthorized(false);
      setError(null);

      try {
        const token = await resolvePublicApiToken();
        if (!token) {
          if (!cancelled) {
            setUnauthorized(true);
            setSession(null);
            setAttempt(null);
          }
          return;
        }

        const result = await publicApiPost<ItemResponse<PublicAssignmentAttemptSession>>(
          `/api/public/assignments/${assignmentIdValue}/attempt`,
          token,
          {},
        );

        if (!cancelled) {
          setSession(result.item);
          setAttempt(result.item.attempt);
        }
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        if (requestError instanceof ApiRequestError) {
          setUnauthorized(requestError.status === 401);
          setError(requestError.message);
        } else if (requestError instanceof Error) {
          setError(requestError.message);
        } else {
          setError("Failed to open the assignment runner.");
        }

        setSession(null);
        setAttempt(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [assignmentIdValue, hasValidIds, reloadKey]);

  if (!hasValidIds) {
    return (
      <PageShell title="Assignment Runner" subtitle="Invalid assignment identifier">
        <ErrorPanel message="The classroom or assignment ID in the URL is invalid." />
      </PageShell>
    );
  }

  if (unauthorized) {
    return (
      <PageShell title="Assignment Runner" subtitle={`Assignment ID: ${assignmentIdValue}`}>
        <UnauthorizedPanel />
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell title="Assignment Runner" subtitle={`Assignment ID: ${assignmentIdValue}`}>
        <LoadingPanel />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Assignment Runner" subtitle={`Assignment ID: ${assignmentIdValue}`}>
        <div className="mb-4">
          <Link
            to={`/classrooms/${classroomIdValue}/assignment/${assignmentIdValue}`}
            className="text-sm text-blue-300 hover:text-blue-200"
          >
            Back to assignment
          </Link>
        </div>
        <ErrorPanel message={error} onRetry={() => setReloadKey((value) => value + 1)} />
      </PageShell>
    );
  }

  if (!session || !attempt) {
    return (
      <PageShell title="Assignment Runner" subtitle={`Assignment ID: ${assignmentIdValue}`}>
        <ErrorPanel message="Assignment runner session could not be loaded." />
      </PageShell>
    );
  }

  if (!parsedScenario?.success) {
    return (
      <PageShell title={session.assignment.title} subtitle={session.assignment.classroom_name}>
        <div className="mb-4">
          <Link
            to={`/classrooms/${classroomIdValue}/assignment/${assignmentIdValue}`}
            className="text-sm text-blue-300 hover:text-blue-200"
          >
            Back to assignment
          </Link>
        </div>
        <ErrorPanel message="Published scenario content is invalid for this assignment." />
      </PageShell>
    );
  }

  const initialNodeId = session.attempt.current_node_id ?? parsedScenario.data.startNodeId;

  return (
    <PageShell title={session.assignment.title} subtitle={session.assignment.classroom_name}>
      <div className="mb-4">
        <Link
          to={`/classrooms/${classroomIdValue}/assignment/${assignmentIdValue}`}
          className="text-sm text-blue-300 hover:text-blue-200"
        >
          Back to assignment
        </Link>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-4">
        <ScenarioViewer
          scenario={parsedScenario.data}
          initialNodeId={initialNodeId}
          attemptId={attempt.id}
          onAttemptUpdate={setAttempt}
          onFinished={() => {navigate(`/classrooms/${classroomIdValue}/assignment/${assignmentIdValue}`)}}
        />
      </div>
    </PageShell>
  );
}

export default AssignmentRunnerPage;
