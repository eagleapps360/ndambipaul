import { getEnvironmentReport } from "../lib/env";
import {
  createSupabaseClients,
  printResults,
  verifyAdminTables,
  verifyAnonymousAccess,
  verifyBucketInventory,
  verifyRoleHelpers,
  verifyTables,
  verifyViews,
  type CheckResult,
} from "./_supabase";

async function main() {
  const results: CheckResult[] = [];
  const report = getEnvironmentReport();

  if (report.demoModeRequested) {
    results.push({
      status: report.mode === "production" ? "FAIL" : "WARN",
      message:
        report.mode === "production"
          ? "Production demo fallback is enabled. Set ALLOW_DEMO_MODE=false before deployment."
          : "Demo fallback is enabled for this environment.",
    });
  } else {
    results.push({ status: "PASS", message: "Production demo fallback disabled." });
  }

  const { anon, service } = createSupabaseClients();
  await verifyTables(service, results);
  await verifyViews(anon, results);
  await verifyRoleHelpers(anon, results);
  await verifyAnonymousAccess(anon, results);
  await verifyAdminTables(service, results);
  await verifyBucketInventory(service, results);

  printResults(results);

  const hasFailures = results.some((result) => result.status === "FAIL");
  if (hasFailures) {
    throw new Error("Supabase verification failed.");
  }
}

main().catch((error) => {
  console.error(`FAIL ${error instanceof Error ? error.message : "Unknown error"}`);
  process.exit(1);
});
