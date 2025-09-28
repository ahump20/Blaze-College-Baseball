import { expect, test } from "@jest/globals";

/**
 * Contract: get-library-docs must return stable, authoritative docs.
 * Sports data appears only in supplement (not in docs).
 */
test("docs: Recharts ResponsiveContainer props are stable and version-matched", async () => {
  const libraryID = "/recharts/recharts";
  const topic = "ResponsiveContainer + LineChart + Tooltip";
  const tokens = 2500;

  const r1 = await mcpCall("get-library-docs", { context7CompatibleLibraryID: libraryID, topic, tokens });
  const r2 = await mcpCall("get-library-docs", { context7CompatibleLibraryID: libraryID, topic, tokens });

  expect(r1.docs).toBeTruthy();
  expect(r1.docs).toEqual(r2.docs);                    // deterministic
  expect(r1.meta.libraryID).toBe(libraryID);
  // naive check that props are present (example; tune as needed)
  expect(r1.docs).toMatch(/<ResponsiveContainer/);
  expect(r1.docs).toMatch(/<LineChart/);
});

test("supplement: sports context is bounded and never pollutes docs", async () => {
  const libraryID = "/mrdoob/three.js";
  const topic = "Performance + BufferGeometry + PointsMaterial";

  const docs = await mcpCall("get-library-docs", { context7CompatibleLibraryID: libraryID, topic, tokens: 2000 });
  const supp = await mcpCall("sports-context", { sport: "baseball", league: "MLB", team: "Cardinals", timeframe: "live", maxTokens: 300 });

  expect(docs.docs).toBeTruthy();
  expect(supp.supplement.type).toBe("context");
  expect(supp.supplement.body.length).toBeLessThanOrEqual(800);
  expect(docs.docs).not.toContain(supp.supplement.body); // docs stay pure

  const merged = await mcpCall("inject-sports-context", {
    context7CompatibleLibraryID: libraryID, topic,
    supplement: supp.supplement
  });
  expect(merged.merged.docs).toBe(docs.docs);
  expect(merged.merged.supplement.body).toBe(supp.supplement.body);
});