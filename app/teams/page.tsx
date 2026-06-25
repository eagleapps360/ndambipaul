import { TeamForm } from "@/components/Forms";
import SectionTitle from "@/components/SectionTitle";
import { getActiveTeams } from "@/lib/content";

export const metadata = {
  title: "Join a Team",
  description: "Volunteer registration for funeral support teams.",
};

export default async function TeamsPage() {
  const teams = await getActiveTeams();
  return (
    <main className="pageMain">
      <section className="pageHero">
        <p className="kicker">Join a Team</p>
        <h1>Volunteer for memorial support</h1>
        <p>Registrations begin as pending and can be approved, contacted, declined or completed by administrators.</p>
      </section>
      <section className="section splitLayout">
        <div>
          <SectionTitle eyebrow="Teams" title="Service areas open for registration" />
          <div className="chips">
            {teams.map((team) => (
              <span key={team.id}>{team.name}</span>
            ))}
          </div>
        </div>
        <TeamForm teams={teams} />
      </section>
    </main>
  );
}
