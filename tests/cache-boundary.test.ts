import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { getPublishedGalleryUncached } from "../lib/content";

const publicClientSource = readFileSync(resolve(process.cwd(), "lib/supabase/public.ts"), "utf8");
const contentSource = readFileSync(resolve(process.cwd(), "lib/content.ts"), "utf8");
const pageSource = readFileSync(resolve(process.cwd(), "app/page.tsx"), "utf8");

test("public supabase client does not depend on next/headers", () => {
  assert.equal(publicClientSource.includes("next/headers"), false);
  assert.equal(publicClientSource.includes("cookies("), false);
});

test("cached public loaders in lib/content.ts do not call createServerSupabaseClient", () => {
  assert.equal(contentSource.includes("createServerSupabaseClient"), false);
  assert.equal(contentSource.includes("cookies("), false);
  assert.equal(contentSource.includes("headers("), false);
});

test("homepage does not force dynamic rendering as a cache-boundary workaround", () => {
  assert.equal(pageSource.includes('dynamic = "force-dynamic"'), false);
});

test("public supabase client fails clearly when required env vars are missing", async () => {
  const modulePath = resolve(process.cwd(), "lib/supabase/public.ts");
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const imported = await import(`${pathToFileURL(modulePath).href}?missing-env-test=${Date.now()}`);

  assert.throws(
    () => imported.createPublicSupabaseClient(),
    /Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY\./,
  );

  process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalAnonKey;
});

test("public gallery loader falls back safely without configured supabase", async () => {
  const items = await getPublishedGalleryUncached();
  assert.ok(Array.isArray(items));
  assert.ok(items.length > 0);
});

test("public programme loader falls back safely without configured supabase", async () => {
  assert.match(contentSource, /Failed to load published programme events/);
  assert.match(contentSource, /return demoProgrammeEvents/);
});

test("public site settings loader falls back safely without crashing", async () => {
  assert.match(contentSource, /Failed to load public site settings/);
  assert.match(contentSource, /return demoSiteSettings/);
});
