import TributeManageForm from "@/components/TributeManageForm";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Manage Tribute",
  description: "Request a secure link to update your tribute submission.",
  path: "/tributes/manage",
  noindex: true,
});

export default function TributeManagePage() {
  return (
    <main className="pageMain">
      <section className="pageHero narrowHero">
        <p className="kicker">Tribute Updates</p>
        <h1>Edit your tribute securely</h1>
        <p>Request a private, time-limited link to update your tribute while preserving moderation and privacy.</p>
      </section>
      <section className="section splitLayout">
        <div>
          <div className="sectionHead">
            <span>Private request</span>
            <h2>Request edit access</h2>
            <p>Your email address is used only to verify ownership and send the secure edit link.</p>
          </div>
        </div>
        <TributeManageForm />
      </section>
    </main>
  );
}
