const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const app = require("../src/app");

const startServer = () =>
  new Promise((resolve, reject) => {
    const server = app.listen(0, "127.0.0.1", () => resolve(server));
    server.on("error", reject);
  });

const requestJson = (server, path) =>
  new Promise((resolve, reject) => {
    const { port } = server.address();
    const req = http.get(
      {
        hostname: "127.0.0.1",
        port,
        path,
      },
      (res) => {
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            resolve({
              statusCode: res.statusCode,
              body: data ? JSON.parse(data) : null,
            });
          } catch (error) {
            reject(error);
          }
        });
      },
    );

    req.on("error", reject);
  });

test("health routes return a success payload", async () => {
  const server = await startServer();

  try {
    const apiHealth = await requestJson(server, "/api/v1/health");
    assert.equal(apiHealth.statusCode, 200);
    assert.equal(apiHealth.body.success, true);
    assert.match(apiHealth.body.message, /healthy/i);

    const rootHealth = await requestJson(server, "/health");
    assert.equal(rootHealth.statusCode, 200);
    assert.equal(rootHealth.body.success, true);
    assert.match(rootHealth.body.message, /healthy/i);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});
