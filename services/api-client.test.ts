import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ApiError,
  createApiClient,
  joinUrl,
  parseApiErrorMessage,
} from "./api-client.ts";

describe("api-client", () => {
  it("joins base URLs and paths without duplicate slashes", () => {
    assert.equal(joinUrl("https://api.example.com/", "/classes"), "https://api.example.com/classes");
    assert.equal(joinUrl("https://api.example.com/v1", "classes"), "https://api.example.com/v1/classes");
  });

  it("adds JSON headers and bearer token when making requests", async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const client = createApiClient({
      baseUrl: "https://api.example.com",
      getToken: () => "test-token",
      fetcher: async (url, init) => {
        calls.push({ url: String(url), init: init ?? {} });

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        });
      },
    });

    const result = await client.post<{ ok: boolean }, { name: string }>("/classes", {
      name: "English A2",
    });

    assert.deepEqual(result, { ok: true });
    assert.equal(calls[0]?.url, "https://api.example.com/classes");
    assert.equal(calls[0]?.init.method, "POST");
    assert.equal((calls[0]?.init.headers as Record<string, string>).Authorization, "Bearer test-token");
    assert.equal((calls[0]?.init.headers as Record<string, string>)["Content-Type"], "application/json");
    assert.equal(calls[0]?.init.body, JSON.stringify({ name: "English A2" }));
  });

  it("throws ApiError with server message on failed requests", async () => {
    const client = createApiClient({
      baseUrl: "https://api.example.com",
      fetcher: async () =>
        new Response(JSON.stringify({ message: "Class not found" }), {
          status: 404,
          headers: {
            "content-type": "application/json",
          },
        }),
    });

    await assert.rejects(() => client.get("/classes/missing"), (error) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.status, 404);
      assert.equal(error.message, "Class not found");
      return true;
    });
  });

  it("parses common API error response shapes", () => {
    assert.equal(parseApiErrorMessage({ message: "Invalid data" }), "Invalid data");
    assert.equal(parseApiErrorMessage({ error: "Unauthorized" }), "Unauthorized");
    assert.equal(parseApiErrorMessage({ errors: ["Email is required"] }), "Email is required");
    assert.equal(parseApiErrorMessage("Plain error"), "Plain error");
    assert.equal(parseApiErrorMessage(null), "Request failed");
  });
});
