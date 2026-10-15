import test from "node:test";
import assert from "node:assert/strict";

// Configuration enables input validation without performing any CMS requests.
process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = "inputtest";
process.env.SANITY_API_WRITE_TOKEN = "test-only-token";
process.env.RELEASE_PUBLISH_SECRET = "test-release-publish-secret";
const productRoute = import("../src/app/api/admin/products/route");
const releaseRoute = import("../src/app/api/releases/publish/route");

function productRequest(body: unknown) {
  return new Request("https://store.example/api/admin/products", {
    method: "POST", headers: { origin: "https://store.example", "content-type": "application/json" }, body: JSON.stringify(body),
  });
}

test("Product API rejects valid JSON values that are not objects", async () => {
  const { POST } = await productRoute;
  for (const body of [null, [], "text", 42]) assert.equal((await POST(productRequest(body))).status, 400);
});

test("Product API rejects malformed feature and FAQ entries before CMS writes", async () => {
  const { POST } = await productRoute;
  const product = { title: "Example", slug: "example", tagline: "Example app", status: "draft", priceBDT: 100, priceUSD: 100, repoUrl: "https://github.com/smile-plzz/example" };
  for (const key of ["features", "faq"]) {
    for (const row of [null, [], "invalid", 42]) assert.equal((await POST(productRequest({ ...product, [key]: [row] }))).status, 400);
  }
});

test("Release API rejects valid JSON values that are not objects", async () => {
  const { POST } = await releaseRoute;
  for (const body of [null, [], "text", 42]) {
    const response = await POST(new Request("https://store.example/api/releases/publish", {
      method: "POST", headers: { authorization: "Bearer test-release-publish-secret", "content-type": "application/json" }, body: JSON.stringify(body),
    }));
    assert.equal(response.status, 400);
  }
});
