import { createClient } from "@supabase/supabase-js";
import { createSupabaseClients, printResults, REQUIRED_BUCKETS, type CheckResult } from "./_supabase";

function buildTextFile(contents: string) {
  return new Blob([contents], { type: "text/plain" });
}

async function main() {
  const results: CheckResult[] = [];
  const { url, anonKey, service } = createSupabaseClients();
  const anon = createClient(url, anonKey, { auth: { persistSession: false } });
  const prefix = `verification/${new Date().toISOString().replace(/[:.]/g, "-")}`;
  const privatePath = `${prefix}/private-check.txt`;
  const publicPath = `${prefix}/public-check.txt`;

  const { data: buckets, error: bucketsError } = await service.storage.listBuckets();
  if (bucketsError) {
    throw new Error("Unable to list storage buckets.");
  }

  for (const bucket of REQUIRED_BUCKETS) {
    const match = buckets.find((item) => item.name === bucket.name);
    if (!match) {
      results.push({ status: "FAIL", message: `${bucket.name} bucket missing.` });
    } else if (match.public !== bucket.public) {
      results.push({ status: "FAIL", message: `${bucket.name} bucket privacy mismatch.` });
    } else {
      results.push({ status: "PASS", message: `${bucket.name} bucket privacy confirmed.` });
    }
  }

  const privateUpload = await service.storage
    .from("memorial-private-submissions")
    .upload(privatePath, buildTextFile("private storage verification"), {
      contentType: "text/plain",
      upsert: false,
    });
  results.push(
    privateUpload.error
      ? { status: "FAIL", message: "Private test upload failed." }
      : { status: "PASS", message: "Private test upload succeeded." },
  );

  const privateAnonRead = await anon.storage.from("memorial-private-submissions").download(privatePath);
  results.push(
    privateAnonRead.error
      ? { status: "PASS", message: "Anonymous private object read denied." }
      : { status: "FAIL", message: "Anonymous private object read unexpectedly succeeded." },
  );

  const privateSigned = await service.storage.from("memorial-private-submissions").createSignedUrl(privatePath, 60);
  if (privateSigned.error || !privateSigned.data?.signedUrl) {
    results.push({ status: "FAIL", message: "Admin signed preview creation failed." });
  } else {
    const signedResponse = await fetch(privateSigned.data.signedUrl);
    results.push(
      signedResponse.ok
        ? { status: "PASS", message: "Admin signed preview access succeeded." }
        : { status: "FAIL", message: "Admin signed preview access failed." },
    );
  }

  const publicUpload = await service.storage
    .from("memorial-public-media")
    .upload(publicPath, buildTextFile("public storage verification"), {
      contentType: "text/plain",
      upsert: false,
    });
  results.push(
    publicUpload.error
      ? { status: "FAIL", message: "Public derivative upload failed." }
      : { status: "PASS", message: "Public derivative upload succeeded." },
  );

  const publicRead = await anon.storage.from("memorial-public-media").download(publicPath);
  results.push(
    publicRead.error
      ? { status: "FAIL", message: "Anonymous public derivative access failed." }
      : { status: "PASS", message: "Anonymous public derivative access succeeded." },
  );

  const cleanupPublic = await service.storage.from("memorial-public-media").remove([publicPath]);
  results.push(
    cleanupPublic.error
      ? { status: "FAIL", message: "Public derivative cleanup failed." }
      : { status: "PASS", message: "Public derivative cleanup succeeded." },
  );

  const publicReadAfterDelete = await anon.storage.from("memorial-public-media").download(publicPath);
  results.push(
    publicReadAfterDelete.error
      ? { status: "PASS", message: "Public derivative removal confirmed." }
      : { status: "FAIL", message: "Public derivative still accessible after cleanup." },
  );

  const cleanupPrivate = await service.storage.from("memorial-private-submissions").remove([privatePath]);
  results.push(
    cleanupPrivate.error
      ? { status: "FAIL", message: "Private verification cleanup failed." }
      : { status: "PASS", message: "Private verification cleanup succeeded." },
  );

  printResults(results);

  const hasFailures = results.some((result) => result.status === "FAIL");
  if (hasFailures) {
    throw new Error("Storage verification failed.");
  }
}

main().catch((error) => {
  console.error(`FAIL ${error instanceof Error ? error.message : "Unknown error"}`);
  process.exit(1);
});
