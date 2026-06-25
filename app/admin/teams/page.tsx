import AdminFormSection from "@/components/admin/AdminFormSection";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminSaveBar from "@/components/admin/AdminSaveBar";
import { saveTeamDefinitionAction } from "@/app/admin/actions";
import { QueryNotice } from "@/app/admin/shared";
import { getTeamsAdminData } from "@/lib/admin-data";
import { requireAdminProfile } from "@/lib/auth";

export default async function AdminTeamsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminProfile(["owner", "administrator", "content_editor"]);
  const [teams, query] = await Promise.all([getTeamsAdminData(), searchParams]);

  return (
    <section className="adminPage">
      <AdminPageHeader
        eyebrow="Volunteer teams"
        title="Team definitions"
        description="Control which volunteer teams are visible to the public and how many registrations they can receive."
      />
      <QueryNotice searchParams={query} />

      <div className="adminRecordStack">
        <form action={saveTeamDefinitionAction} className="form">
          <AdminFormSection title="Create team">
            <div className="formGrid">
              <label>
                Name
                <input name="name" required />
              </label>
              <label>
                Slug
                <input name="slug" required />
              </label>
              <label>
                Coordinator name
                <input name="coordinator_name" />
              </label>
              <label>
                Capacity
                <input name="capacity" type="number" />
              </label>
              <label>
                Display order
                <input name="display_order" type="number" defaultValue="0" />
              </label>
            </div>
            <label>
              Description
              <textarea name="description" rows={4} />
            </label>
            <div className="adminCheckRow">
              <label className="check">
                <input name="public_signup_available" type="checkbox" defaultChecked />
                Public signup available
              </label>
              <label className="check">
                <input name="is_active" type="checkbox" defaultChecked />
                Active
              </label>
            </div>
          </AdminFormSection>
          <AdminSaveBar label="Create team" />
        </form>

        {teams.map((team: any) => (
          <form key={team.id} action={saveTeamDefinitionAction} className="form adminRecordCard">
            <input type="hidden" name="id" value={team.id} />
            <AdminFormSection title={team.name} description={team.slug}>
              <div className="formGrid">
                <label>
                  Name
                  <input name="name" defaultValue={team.name} required />
                </label>
                <label>
                  Slug
                  <input name="slug" defaultValue={team.slug} required />
                </label>
                <label>
                  Coordinator name
                  <input name="coordinator_name" defaultValue={team.coordinator_name || team.coordinatorName || ""} />
                </label>
                <label>
                  Capacity
                  <input name="capacity" type="number" defaultValue={String(team.capacity || "")} />
                </label>
                <label>
                  Display order
                  <input name="display_order" type="number" defaultValue={String(team.display_order ?? team.displayOrder ?? 0)} />
                </label>
              </div>
              <label>
                Description
                <textarea name="description" rows={4} defaultValue={team.description || ""} />
              </label>
              <div className="adminCheckRow">
                <label className="check">
                  <input name="public_signup_available" type="checkbox" defaultChecked={Boolean(team.public_signup_available)} />
                  Public signup available
                </label>
                <label className="check">
                  <input name="is_active" type="checkbox" defaultChecked={team.is_active !== false} />
                  Active
                </label>
              </div>
            </AdminFormSection>
            <AdminSaveBar label="Save team" />
          </form>
        ))}
      </div>
    </section>
  );
}
