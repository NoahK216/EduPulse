import { authClient } from "../../lib/auth-client";
import { LoadingPanel } from "../ui/DataStatePanels";
import PageShell from "../ui/PageShell";
import AuthenticatedHome from "./AuthenticatedHome";
import GuestHome from "./GuestHome";

function Home() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <PageShell title="EduPulse" subtitle="Loading your home page">
        <LoadingPanel />
      </PageShell>
    );
  }

  if (session?.session) {
    return <AuthenticatedHome />;
  }

  return <GuestHome />;
}

export default Home;
