import SectionTitle from "@/components/SectionTitle";
import { getPublicCoordinators } from "@/lib/content";

export const metadata = {
  title: "Coordinators",
  description: "Coordinator groups and public contact details where explicitly approved.",
};

export default async function CoordinatorsPage() {
  const coordinatorGroups = await getPublicCoordinators();
  return (
    <main className="pageMain">
      <section className="pageHero">
        <p className="kicker">Coordinators</p>
        <h1>Departments supporting the memorial</h1>
        <p>Only contacts explicitly marked public are shown here. Private details stay visible to administrators only.</p>
      </section>
      <section className="section">
        <SectionTitle eyebrow="Departments" title="From officiating ministers to hospitality and media" />
        <div className="coordinatorGrid">
          {coordinatorGroups.map((group) => (
            <article key={group.title} className="coordinatorCard">
              <span className="avatar">{group.title[0]}</span>
              <h2>{group.title}</h2>
              <p>{group.description}</p>
              <div className="contactList">
                {group.contacts.some((contact) => contact.publicPhone || contact.publicEmail) ? (
                  group.contacts
                    .filter((contact) => contact.publicPhone || contact.publicEmail)
                    .map((contact) => (
                      <small key={contact.id}>
                        {contact.name} · {contact.phone} · {contact.email}
                      </small>
                    ))
                ) : (
                  <small>Public contact details are withheld for this department.</small>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
