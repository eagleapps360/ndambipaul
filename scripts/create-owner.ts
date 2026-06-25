import { createSupabaseClients } from "./_supabase";

function readFlag(name: string) {
  const args = process.argv.slice(2);
  const index = args.findIndex((arg) => arg === name);
  if (index === -1) return undefined;
  return args[index + 1];
}

function hasFlag(name: string) {
  return process.argv.slice(2).includes(name);
}

async function listAllAuthUsersByEmail(email: string) {
  const { service } = createSupabaseClients();
  const matches: Array<{ id: string; email: string | undefined }> = [];
  let page = 1;
  let lastPage = 1;

  while (page <= lastPage) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      throw new Error(`Unable to list Supabase Auth users: ${error.message}`);
    }

    lastPage = data.lastPage || 1;
    data.users
      .filter((user) => user.email?.toLowerCase() === email)
      .forEach((user) => matches.push({ id: user.id, email: user.email }));
    page += 1;
  }

  return matches;
}

async function main() {
  const email = (readFlag("--email") || "").trim().toLowerCase();
  const displayName = (readFlag("--name") || "").trim();
  const inviteIfMissing = hasFlag("--invite-if-missing");

  if (!email || !displayName) {
    throw new Error('Usage: npm run create:owner -- --email owner@example.com --name "Family Owner" [--invite-if-missing]');
  }

  const { service } = createSupabaseClients();
  const { data: existingOwners, error: ownerError } = await service
    .from("admin_users")
    .select("id, email, auth_user_id")
    .eq("role", "owner")
    .eq("is_active", true);

  if (ownerError) {
    throw new Error(`Unable to inspect existing owners: ${ownerError.message}`);
  }
  if ((existingOwners || []).length > 0) {
    throw new Error("An active owner already exists. Refusing to replace or duplicate the first owner.");
  }

  const matchingUsers = await listAllAuthUsersByEmail(email);
  if (matchingUsers.length > 1) {
    throw new Error("Multiple Supabase Auth users matched this email. Resolve the conflict before creating an owner profile.");
  }

  let authUserId = matchingUsers[0]?.id || null;
  let bootstrapSummary = "Owner linked to an existing Supabase Auth user.";

  if (!authUserId) {
    if (!inviteIfMissing) {
      throw new Error(
        "No Supabase Auth user matched this email. Ask the owner to create their Auth account first, or rerun with --invite-if-missing.",
      );
    }

    const inviteResult = await service.auth.admin.inviteUserByEmail(email, {
      data: {
        display_name: displayName,
        requested_role: "owner",
      },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin/auth/callback`,
    });
    if (inviteResult.error || !inviteResult.data.user?.id) {
      throw new Error(
        `Unable to invite the owner through Supabase Auth: ${inviteResult.error?.message || "unknown invite error"}`,
      );
    }
    authUserId = inviteResult.data.user.id;
    bootstrapSummary = "Owner invited through Supabase Auth and linked as the first owner.";
  }

  const timestamp = new Date().toISOString();
  const adminUser = await service.from("admin_users").upsert(
    {
      auth_user_id: authUserId,
      email,
      display_name: displayName,
      role: "owner",
      is_active: true,
      updated_at: timestamp,
    },
    { onConflict: "email" },
  );
  if (adminUser.error) {
    throw new Error(`Unable to write admin_users record: ${adminUser.error.message}`);
  }

  const adminProfile = await service.from("admin_profiles").upsert(
    {
      user_id: authUserId,
      display_name: displayName,
      role: "owner",
      is_active: true,
      invited_at: timestamp,
      updated_at: timestamp,
    },
    { onConflict: "user_id" },
  );
  if (adminProfile.error) {
    throw new Error(`Unable to write admin_profiles record: ${adminProfile.error.message}`);
  }

  await service.from("audit_log").insert({
    actor_user_id: null,
    action: "owner.bootstrap",
    entity_type: "admin_profile",
    entity_id: authUserId,
    summary: `First owner bootstrap completed for ${email}.`,
  });

  console.log(`PASS ${bootstrapSummary}`);
  console.log(`PASS First owner established for ${email}.`);
  if (!(process.env.ADMIN_EMAIL_ALLOWLIST || "").toLowerCase().split(",").map((item) => item.trim()).includes(email)) {
    console.log("WARN ADMIN_EMAIL_ALLOWLIST does not currently include this owner email.");
  }
}

main().catch((error) => {
  console.error(`FAIL ${error instanceof Error ? error.message : "Unknown error"}`);
  process.exit(1);
});
