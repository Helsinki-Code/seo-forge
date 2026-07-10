import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact — SEO Forge",
  description: "Talk to the team behind the autonomous SEO agents.",
};

export default function ContactPage() {
  return (
    <main className="grid-fade min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 pb-24 pt-16">
        <h1 className="text-4xl font-bold">Talk to a human</h1>
        <p className="mt-3 text-lg text-fg-mute">
          The agents handle the SERPs; we handle everything else. Questions about plans,
          custom workflows, or agencies — send a note.
        </p>
        <div className="mt-10">
          <ContactForm />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
