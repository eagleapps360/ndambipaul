import { getEnvironmentReport } from "../lib/env";
import {
  createSupabaseClients,
  ensureConnectivity,
  getScriptArgs,
  printResults,
  REQUIRED_BUCKETS,
  type CheckResult,
} from "./_supabase";

async function ensureBuckets(dryRun: boolean, results: CheckResult[]) {
  const { service } = createSupabaseClients();
  const { data: buckets, error } = await service.storage.listBuckets();
  if (error) {
    results.push({ status: "FAIL", message: "Unable to list storage buckets during setup." });
    return;
  }

  for (const bucket of REQUIRED_BUCKETS) {
    const existing = buckets.find((item) => item.name === bucket.name);
    if (!existing) {
      if (dryRun) {
        results.push({ status: "ACTION", message: `Would create ${bucket.name} bucket (public=${String(bucket.public)}).` });
        continue;
      }

      const { error: createError } = await service.storage.createBucket(bucket.name, {
        public: bucket.public,
      });
      if (createError) {
        results.push({ status: "FAIL", message: `Failed to create ${bucket.name} bucket.` });
      } else {
        results.push({ status: "PASS", message: `${bucket.name} bucket created.` });
      }
      continue;
    }

    if (existing.public !== bucket.public) {
      if (dryRun) {
        results.push({
          status: "ACTION",
          message: `Would update ${bucket.name} bucket privacy to public=${String(bucket.public)}.`,
        });
        continue;
      }

      const { error: updateError } = await service.storage.updateBucket(bucket.name, {
        public: bucket.public,
      });
      if (updateError) {
        results.push({ status: "FAIL", message: `Failed to update ${bucket.name} bucket privacy.` });
      } else {
        results.push({ status: "PASS", message: `${bucket.name} bucket privacy reconciled.` });
      }
      continue;
    }

    results.push({ status: "PASS", message: `${bucket.name} bucket already present with expected privacy.` });
  }
}

async function main() {
  const args = getScriptArgs();
  const results: CheckResult[] = [];
  const report = getEnvironmentReport();

  results.push({ status: "PASS", message: `Environment mode: ${report.mode}.` });
  results.push({
    status: report.demoModeRequested ? "WARN" : "PASS",
    message: report.demoModeRequested
      ? "ALLOW_DEMO_MODE is enabled. Disable it before production deployment."
      : "ALLOW_DEMO_MODE is disabled.",
  });

  for (const warning of report.warnings) {
    results.push({ status: "WARN", message: warning });
  }

  const { service } = createSupabaseClients();
  await ensureConnectivity(service, results);
  await ensureBuckets(args.dryRun, results);

  if (args.withSeed) {
    results.push({
      status: "WARN",
      message: "No idempotent live seed script exists in this repository yet. Seed data was not applied.",
    });
  } else {
    results.push({
      status: "ACTION",
      message: "Seed data not applied. Add an idempotent seed script before relying on fresh-project bootstrap.",
    });
  }

  results.push({
    status: "ACTION",
    message: "Run npm run create:owner -- --email owner@example.com --name \"Family Owner\" after Supabase bootstrap.",
  });
  results.push({
    status: "ACTION",
    message: "Run npm run verify:supabase and npm run verify:storage after setup.",
  });

  printResults(results);

  const hasFailures = results.some((result) => result.status === "FAIL");
  if (hasFailures) {
    throw new Error("Supabase setup checks failed.");
  }
}

main().catch((error) => {
  console.error(`FAIL ${error instanceof Error ? error.message : "Unknown error"}`);
  process.exit(1);
});
