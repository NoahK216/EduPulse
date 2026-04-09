import { authClient } from "../../lib/auth-client";
import { LoadingPanel } from "../../components/data/DataStatePanels";
import PageShell from "../../components/layout/PageShell";
import AuthenticatedHome from "./views/AuthenticatedHome";
import GuestHome from "./views/GuestHome";

function HomePage() {
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

export default HomePage;
