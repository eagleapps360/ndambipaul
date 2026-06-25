import AdminFormSection from "@/components/admin/AdminFormSection";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminSaveBar from "@/components/admin/AdminSaveBar";
import { updateSiteSettingsAction } from "@/app/admin/actions";
import { QueryNotice } from "@/app/admin/shared";
import { requireAdminProfile } from "@/lib/auth";
import { getPublicSiteSettings } from "@/lib/content";
import { getSettingsEditorData } from "@/lib/admin-data";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminProfile(["owner", "administrator", "content_editor"]);
  const [rows, publicSite, query] = await Promise.all([
    getSettingsEditorData(),
    getPublicSiteSettings(),
    searchParams,
  ]);
  const settings = (rows[0] || {}) as any;

  return (
    <section className="adminPage">
      <AdminPageHeader
        eyebrow="Memorial settings"
        title="Public memorial settings"
        description="Update the memorial identity, contact points, donation notes and homepage messaging without editing source files."
      />
      <QueryNotice searchParams={query} />

      <form action={updateSiteSettingsAction} className="form adminLongForm">
        <input type="hidden" name="id" value={String(settings.id || "demo-settings")} />

        <AdminFormSection title="Identity" description="Core public details shown across the memorial website and metadata.">
          <div className="formGrid">
            <label>
              Memorial name
              <input name="memorial_name" defaultValue={settings.memorial_name || publicSite.memorialName} />
            </label>
            <label>
              Subtitle
              <input name="subtitle" defaultValue={settings.subtitle || publicSite.subtitle} />
            </label>
            <label>
              Birth date
              <input name="birth_date" defaultValue={settings.birth_date || publicSite.dates.birth} />
            </label>
            <label>
              Passing date
              <input name="passing_date" defaultValue={settings.passing_date || publicSite.dates.passing} />
            </label>
            <label>
              Memorial weekend
              <input name="memorial_weekend" defaultValue={settings.memorial_weekend || publicSite.dates.memorialWeekend} />
            </label>
            <label>
              Public website URL
              <input name="public_website_url" defaultValue={settings.public_website_url || ""} />
            </label>
          </div>
        </AdminFormSection>

        <AdminFormSection title="Homepage message" description="Hero copy, biography summary and fallback messaging for important public sections.">
          <label>
            Hero heading
            <input name="hero_heading" defaultValue={settings.hero_heading || publicSite.hero.heading} />
          </label>
          <label>
            Hero message
            <textarea name="hero_message" rows={4} defaultValue={settings.hero_message || publicSite.hero.copy} />
          </label>
          <label>
            Homepage biography excerpt
            <textarea
              name="homepage_biography_excerpt"
              rows={3}
              defaultValue={settings.homepage_biography_excerpt || publicSite.hero.biographyExcerpt}
            />
          </label>
          <label>
            Biography introduction
            <textarea name="biography_introduction" rows={4} defaultValue={settings.biography_introduction || publicSite.biographyIntroduction} />
          </label>
          <label>
            Livestream fallback message
            <textarea
              name="livestream_fallback_message"
              rows={3}
              defaultValue={settings.livestream_fallback_message || publicSite.livestreamFallbackMessage}
            />
          </label>
          <label>
            Footer message
            <textarea name="footer_message" rows={3} defaultValue={settings.footer_message || ""} />
          </label>
        </AdminFormSection>

        <AdminFormSection title="Search and sharing" description="Metadata used by search engines, social cards and quick share actions.">
          <div className="formGrid">
            <label>
              SEO title
              <input name="seo_title" defaultValue={settings.seo_title || publicSite.seo.title} />
            </label>
            <label>
              Open Graph image
              <input name="open_graph_image" defaultValue={settings.open_graph_image || publicSite.openGraphImage} />
            </label>
          </div>
          <label>
            SEO description
            <textarea name="seo_description" rows={3} defaultValue={settings.seo_description || publicSite.seo.description} />
          </label>
          <label>
            WhatsApp share text
            <textarea name="whatsapp_share_text" rows={3} defaultValue={settings.whatsapp_share_text || publicSite.shareText} />
          </label>
        </AdminFormSection>

        <AdminFormSection title="Contacts and donations" description="Public family contact details and donation instructions shown to visitors.">
          <div className="formGrid">
            <label>
              Family contact email
              <input name="family_contact_email" defaultValue={settings.public_family_contacts?.primaryEmail || publicSite.familyContacts.primaryEmail} />
            </label>
            <label>
              Family contact phone
              <input name="family_contact_phone" defaultValue={settings.public_family_contacts?.primaryPhone || publicSite.familyContacts.primaryPhone} />
            </label>
            <label>
              Family WhatsApp contact
              <input name="family_whatsapp_contact" defaultValue={settings.family_whatsapp_contact || ""} />
            </label>
            <label>
              Default timezone
              <input name="default_timezone" defaultValue={settings.default_timezone || "Africa/Douala"} />
            </label>
          </div>
          <label className="check">
            <input
              name="mobile_money_visible"
              type="checkbox"
              defaultChecked={Boolean(settings.mobile_money_settings?.visible)}
            />
            Enable mobile money details
          </label>
          <div className="formGrid">
            <label>
              MTN display name
              <input name="mtn_display_name" defaultValue={settings.mobile_money_settings?.mtnDisplayName || ""} />
            </label>
            <label>
              MTN display number
              <input name="mtn_display_number" defaultValue={settings.mobile_money_settings?.mtnDisplayNumber || publicSite.mobileMoney.mtnDisplayNumber} />
            </label>
            <label>
              Orange display name
              <input name="orange_display_name" defaultValue={settings.mobile_money_settings?.orangeDisplayName || ""} />
            </label>
            <label>
              Orange display number
              <input name="orange_display_number" defaultValue={settings.mobile_money_settings?.orangeDisplayNumber || publicSite.mobileMoney.orangeDisplayNumber} />
            </label>
          </div>
          <label>
            Donation instructions
            <textarea name="donation_instructions" rows={4} defaultValue={settings.donation_instructions || ""} />
          </label>
          <label>
            Venue overview
            <textarea name="venue_overview" rows={3} defaultValue={settings.venue_information?.overview || ""} />
          </label>
        </AdminFormSection>

        <AdminSaveBar label="Save memorial settings" helper="Saving updates the database, records the audit entry and refreshes the public site cache." />
      </form>
    </section>
  );
}
