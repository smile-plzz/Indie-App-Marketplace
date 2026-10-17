import test from "node:test";
import assert from "node:assert/strict";
import type { SanityClient } from "@sanity/client";
import { cmsLoginLimited } from "../src/lib/marketplace/admin-login-limit";

test("CMS login throttling permits only five attempts across concurrent callers", async () => {
  let record: { _rev: string; bucket: number; hits: number } | undefined;
  let revision = 0;
  const client = {
    async createIfNotExists(doc: { bucket: number; hits: number }) { record ??= { ...doc, _rev: String(revision) }; },
    async getDocument() { return record && { ...record }; },
    patch() {
      let expected: string;
      let update: { bucket: number; hits: number };
      const patch = {
        ifRevisionId(value: string) { expected = value; return patch; },
        set(value: typeof update) { update = value; return patch; },
        async commit() {
          if (record?._rev !== expected) throw Object.assign(new Error("Conflict"), { statusCode: 409 });
          record = { ...update, _rev: String(++revision) };
        },
      };
      return patch;
    },
  } as unknown as SanityClient;
  const request = new Request("https://store.example/api/admin/session", { headers: { "x-forwarded-for": "192.0.2.1" } });
  const results = await Promise.all(Array.from({ length: 12 }, () => cmsLoginLimited(request, client, "test-secret")));
  assert.equal(results.filter(limited => !limited).length, 5);
  assert.equal(record?.hits, 5);
  record!.bucket--;
  assert.equal(await cmsLoginLimited(request, client, "test-secret"), false);
  assert.equal(record?.hits, 1);
});

test("CMS login throttling fails closed when storage fails", async () => {
  const client = { async createIfNotExists() { throw new Error("CMS unavailable"); } } as unknown as SanityClient;
  await assert.rejects(cmsLoginLimited(new Request("https://store.example"), client, "test-secret"), /CMS unavailable/);
});
