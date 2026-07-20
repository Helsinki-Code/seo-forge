import { auth } from "@clerk/nextjs/server";
import { DemoBanner, PageHeader } from "@/components/ui";
import ConnectPrompt from "@/components/ConnectPrompt";
import FindingsBoard from "@/components/FindingsBoard";
import { getUserSite, getFindings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function FindingsPage() {
  const { userId } = await auth();
  const { site, demo } = await getUserSite(userId!);
  if (!site) return <ConnectPrompt />;

  const { data: findings } = await getFindings(site.id);

  return (
    <>
      <PageHeader
        title="Findings"
        subtitle="Evidence-backed findings from the Content Growth and Search Optimization agents — drag to accept, defer, or dismiss."
      />
      <DemoBanner demo={demo} />
      <div className="panel overflow-x-auto p-4">
        <FindingsBoard initialFindings={findings} />
      </div>
    </>
  );
}
