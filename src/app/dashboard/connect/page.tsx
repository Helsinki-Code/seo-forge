import { PageHeader } from "@/components/ui";
import ConnectSiteForm from "@/components/ConnectSiteForm";

export const metadata = { title: "Connect your site — SEO Forge" };

export default function ConnectPage() {
  return (
    <>
      <PageHeader
        title="Connect your website"
        subtitle="Point the agent team at your site — a GitHub-deployed site or a WordPress site."
      />
      <div className="max-w-3xl">
        <ConnectSiteForm />
        <p className="mt-4 text-xs leading-relaxed text-fg-faint">
          Credentials are encrypted at rest and only used server-side: GitHub tokens let
          agents push proposal branches (never to your default branch); WordPress
          application passwords are only used when <em>you</em> approve a change.
        </p>
      </div>
    </>
  );
}
