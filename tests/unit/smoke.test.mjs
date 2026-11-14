import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyServices, waitForServices } from '../helpers/smoke.mjs';

const commit = 'a'.repeat(40);
function server({ apiCommit = commit, webCommit = commit, database = 'up', products = [{ id: 1 }] } = {}) {
  return async url => {
    const path = new URL(url).pathname;
    const data = { '/health': { status: 'ok', details: { database: { status: database } } }, '/version': { commit: apiCommit }, '/products': products, '/api/version': { commit: webCommit } };
    return new Response(path === '/menu' ? '<title>Menu | BrewLite</title>' : JSON.stringify(data[path]), { status: 200 });
  };
}
const options = { apiUrl: 'https://api.example', webUrl: 'https://web.example', expectedCommit: commit };

test('Healthy old API must fail when an expected SHA is requested', async () => {
  await assert.rejects(verifyServices({ ...options, fetchImpl: server({ apiCommit: 'b'.repeat(40) }) }), /API commit/);
});
test('Matching API with stale web must fail SHA verification', async () => {
  await assert.rejects(verifyServices({ ...options, fetchImpl: server({ webCommit: 'b'.repeat(40) }) }), /Web commit/);
});
test('Matching SHA cannot hide a database outage', async () => {
  await assert.rejects(verifyServices({ ...options, fetchImpl: server({ database: 'down' }) }), /Database/);
});
test('Matching API, web, database and menu succeed', async () => {
  assert.equal((await verifyServices({ ...options, fetchImpl: server() })).commitVerified, true);
});
test('A successful products HTTP response with an empty catalogue is not ready', async () => {
  await assert.rejects(verifyServices({ ...options, fetchImpl: server({ products: [] }) }), /Products/);
});
test('HTTP 503 is not accepted as successful health', async () => {
  await assert.rejects(verifyServices({ ...options, fetchImpl: async () => new Response('', { status: 503 }) }), /HTTP 503/);
});
test('Legacy application can smoke without version endpoints and never claims a verified SHA', async () => {
  const paths = [];
  const result = await verifyServices({ ...options, expectedCommit: undefined, fetchImpl: async url => { paths.push(new URL(url).pathname); return server()(url); } });
  assert.equal(result.commitVerified, false);
  assert.deepEqual(paths, ['/health', '/products', '/menu']);
});
test('Polling stale SHA is bounded and fails instead of reporting deployment success', async () => {
  let waits = 0;
  await assert.rejects(waitForServices({ ...options, fetchImpl: server({ apiCommit: 'b'.repeat(40) }), attempts: 2, sleep: async () => { waits++; } }), /did not become ready/);
  assert.equal(waits, 1);
});
