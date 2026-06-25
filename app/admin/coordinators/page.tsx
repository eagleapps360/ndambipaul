import AdminFormSection from "@/components/admin/AdminFormSection";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminSaveBar from "@/components/admin/AdminSaveBar";
import { saveCoordinatorAction } from "@/app/admin/actions";
import { QueryNotice } from "@/app/admin/shared";
import { getCoordinatorsAdminData } from "@/lib/admin-data";
import { requireAdminProfile } from "@/lib/auth";

export default async function AdminCoordinatorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminProfile(["owner", "administrator", "content_editor"]);
  const [coordinators, query] = await Promise.all([getCoordinatorsAdminData(), searchParams]);

  return (
    <section className="adminPage">
      <AdminPageHeader
        eyebrow="Coordinators"
        title="Coordinator directory"
        description="Maintain the public and private coordinator contact list by department."
      />
      <QueryNotice searchParams={query} />

      <div className="adminRecordStack">
        <form action={saveCoordinatorAction} className="form">
          <AdminFormSection title="Add coordinator">
            <div className="formGrid">
              <label>
                Department
                <input name="department" required />
              </label>
              <label>
                Department slug
                <input name="department_slug" required />
              </label>
              <label>
                Department order
                <input name="department_order" type="number" defaultValue="0" />
              </label>
              <label>
                Name
                <input name="name" required />
              </label>
              <label>
                Role title
                <input name="role_title" />
              </label>
              <label>
                Display order
                <input name="display_order" type="number" defaultValue="0" />
              </label>
            </div>
            <label>
              Department description
              <textarea name="department_description" rows={3} />
            </label>
            <div className="formGrid">
              <label>
                Public phone
                <input name="public_phone" />
              </label>
              <label>
                Public email
                <input name="public_email" />
              </label>
              <label>
                Private phone
                <input name="private_phone" />
              </label>
              <label>
                Private email
                <input name="private_email" />
              </label>
            </div>
            <div className="adminCheckRow">
              <label className="check">
                <input name="public_phone_flag" type="checkbox" />
                Show phone publicly
              </label>
              <label className="check">
                <input name="public_email_flag" type="checkbox" />
                Show email publicly
              </label>
              <label className="check">
                <input name="is_active" type="checkbox" defaultChecked />
                Active
              </label>
            </div>
          </AdminFormSection>
          <AdminSaveBar label="Create coordinator" />
        </form>

        {coordinators.map((item: any) => (
          <form key={item.id} action={saveCoordinatorAction} className="form adminRecordCard">
            <input type="hidden" name="id" value={item.id} />
            <AdminFormSection title={item.name} description={`${item.department} · ${item.role_title || "Coordinator"}`}>
              <div className="formGrid">
                <label>
                  Department
                  <input name="department" defaultValue={item.department} required />
                </label>
                <label>
                  Department slug
                  <input name="department_slug" defaultValue={item.department_slug || ""} required />
                </label>
                <label>
                  Department order
                  <input name="department_order" type="number" defaultValue={String(item.department_order ?? 0)} />
                </label>
                <label>
                  Name
                  <input name="name" defaultValue={item.name} required />
                </label>
                <label>
                  Role title
                  <input name="role_title" defaultValue={item.role_title || ""} />
                </label>
                <label>
                  Display order
                  <input name="display_order" type="number" defaultValue={String(item.display_order ?? 0)} />
                </label>
              </div>
              <label>
                Department description
                <textarea name="department_description" rows={3} defaultValue={item.department_description || ""} />
              </label>
              <div className="formGrid">
                <label>
                  Public phone
                  <input name="public_phone" defaultValue={item.public_phone || ""} />
                </label>
                <label>
                  Public email
                  <input name="public_email" defaultValue={item.public_email || ""} />
                </label>
                <label>
                  Private phone
                  <input name="private_phone" defaultValue={item.private_phone || ""} />
                </label>
                <label>
                  Private email
                  <input name="private_email" defaultValue={item.private_email || ""} />
                </label>
              </div>
              <div className="adminCheckRow">
                <label className="check">
                  <input name="public_phone_flag" type="checkbox" defaultChecked={Boolean(item.public_phone_flag)} />
                  Show phone publicly
                </label>
                <label className="check">
                  <input name="public_email_flag" type="checkbox" defaultChecked={Boolean(item.public_email_flag)} />
                  Show email publicly
                </label>
                <label className="check">
                  <input name="is_active" type="checkbox" defaultChecked={item.is_active !== false} />
                  Active
                </label>
              </div>
            </AdminFormSection>
            <AdminSaveBar label="Save coordinator" />
          </form>
        ))}
      </div>
    </section>
  );
}
