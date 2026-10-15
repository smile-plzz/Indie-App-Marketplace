import test from "node:test";
import assert from "node:assert/strict";
import type { SanityClient } from "@sanity/client";
import { importPreparedContent, preparedDocuments } from "../src/lib/marketplace/import-content";

type Doc = { _id: string; _type: string; [key: string]: unknown };
function memoryClient(initial: Doc[] = []) {
  const records = new Map(initial.map(doc => [doc._id, structuredClone(doc)]));
  const client = {
    async fetch(query: string, params: { ids: string[]; slugs?: string[] }) {
      return [...records.values()].filter(doc => params.ids.includes(doc._id) ||
        (query.includes('siteSettings') && (doc._type === 'siteSettings' ||
          params.slugs?.includes((doc.slug as { current?: string })?.current || ''))));
    },
    transaction() {
      const mutations: Array<() => void> = [];
      const tx = {
        createIfNotExists(doc: Doc) { mutations.push(() => { if (!records.has(doc._id)) records.set(doc._id, structuredClone(doc)); }); return tx; },
        patch(id: string, patch: { set: Record<string, unknown> }) {
          mutations.push(() => {
            const doc = records.get(id)!;
            for (const [key, value] of Object.entries(patch.set)) {
              if (key === 'links.medium') doc.links = { ...(doc.links as object), medium: value };
              else doc[key] = value;
            }
          }); return tx;
        },
        async commit() { mutations.forEach(mutation => mutation()); },
      };
      return tx;
    },
  } as unknown as SanityClient;
  return { client, records };
}

test('Content import is repeatable and preserves owner edits', async () => {
  const { client, records } = memoryClient();
  const first = await importPreparedContent(client);
  assert.equal(first.verifiedRecords, preparedDocuments.length);
  const product = [...records.values()].find(doc => doc._type === 'product')!;
  product.title = 'Owner edited title';
  const second = await importPreparedContent(client);
  assert.equal(second.created, 0);
  assert.equal(second.preserved, preparedDocuments.length);
  assert.equal(records.get(product._id)?.title, 'Owner edited title');
});

test('Existing product slugs keep their owner records and review history', async () => {
  const source = preparedDocuments.find(doc => doc._type === 'product')!;
  const { client, records } = memoryClient([{ ...source, _id: 'owner-product', title: 'Custom title' },
    { _id: 'owner-settings', _type: 'siteSettings', role: 'My role', about: ['My biography'], links: { github: 'https://github.com/smile-plzz' } }]);
  const result = await importPreparedContent(client);
  assert.equal(result.verifiedRecords, result.expectedRecords);
  assert.equal(records.has(source._id), false);
  assert.equal(records.get('owner-product')?.title, 'Custom title');
  assert.equal(records.get('owner-settings')?.role, 'My role');
  assert.deepEqual(records.get('owner-settings')?.about, ['My biography']);
  assert.equal([...records.values()].some(doc => (doc.product as { _ref?: string })?._ref === 'owner-product'), false);
});
