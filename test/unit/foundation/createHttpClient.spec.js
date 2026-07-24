import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import createHttpClient from '@/foundation/http/createHttpClient';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeClient(overrides = {}) {
    return createHttpClient({
        baseURL: 'http://api.test',
        getAccessToken: vi.fn(() => null),
        setAccessToken: vi.fn(),
        clearAccessToken: vi.fn(),
        maxRetry: 2,
        retryDelay: 0,
        ...overrides
    });
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('createHttpClient', () => {
    let client;
    let mockAxios;

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        mockAxios?.restore();
        vi.useRealTimers();
    });

    // ── Return shape ─────────────────────────────────────────────────────────
    describe('return value', () => {
        it('returns httpRequestApp, fakeRequestApp, mock, axiosIns, axiosOutside', () => {
            client = makeClient();
            expect(client).toHaveProperty('httpRequestApp');
            expect(client).toHaveProperty('fakeRequestApp');
            expect(client).toHaveProperty('mock');
            expect(client).toHaveProperty('axiosIns');
            expect(client).toHaveProperty('axiosOutside');
        });

        it('httpRequestApp exposes get, post, put, delete', () => {
            client = makeClient();
            expect(typeof client.httpRequestApp.get).toBe('function');
            expect(typeof client.httpRequestApp.post).toBe('function');
            expect(typeof client.httpRequestApp.put).toBe('function');
            expect(typeof client.httpRequestApp.delete).toBe('function');
        });
    });

    // ── Request interceptor ───────────────────────────────────────────────────
    describe('request interceptor — Authorization header', () => {
        it('attaches Bearer token when getAccessToken returns a value', async () => {
            const getAccessToken = vi.fn(() => 'my-token');
            client = makeClient({ getAccessToken });
            mockAxios = new MockAdapter(client.axiosIns);

            let capturedHeaders;
            mockAxios.onGet('/me').reply((config) => {
                capturedHeaders = config.headers;
                return [200, { result: 'ok' }];
            });

            const p = client.httpRequestApp.get('/me');
            await vi.runAllTimersAsync();
            await p;

            expect(capturedHeaders.Authorization).toBe('Bearer my-token');
        });

        it('does not set Authorization when token is null', async () => {
            client = makeClient({ getAccessToken: vi.fn(() => null) });
            mockAxios = new MockAdapter(client.axiosIns);

            let capturedHeaders;
            mockAxios.onGet('/me').reply((config) => {
                capturedHeaders = config.headers;
                return [200, {}];
            });

            const p = client.httpRequestApp.get('/me');
            await vi.runAllTimersAsync();
            await p;

            expect(capturedHeaders.Authorization).toBeUndefined();
        });
    });

    // ── Response interceptor — resultCodeHandlers ─────────────────────────────
    describe('response interceptor — resultCodeHandlers', () => {
        it('calls the matching handler on a successful response with result_code', async () => {
            const handler = vi.fn();
            client = makeClient({ resultCodeHandlers: { TOKEN_EXPIRED: handler } });
            mockAxios = new MockAdapter(client.axiosIns);

            mockAxios.onGet('/data').reply(200, { result_code: 'TOKEN_EXPIRED', value: 42 });

            const p = client.httpRequestApp.get('/data');
            await vi.runAllTimersAsync();
            await p;

            expect(handler).toHaveBeenCalledOnce();
            expect(handler.mock.calls[0][0]).toHaveProperty('response');
        });

        it('does not throw when no handler is registered for a result_code', async () => {
            client = makeClient({ resultCodeHandlers: {} });
            mockAxios = new MockAdapter(client.axiosIns);

            mockAxios.onGet('/data').reply(200, { result_code: 'UNKNOWN' });

            const p = client.httpRequestApp.get('/data');
            await vi.runAllTimersAsync();
            await expect(p).resolves.toBeDefined();
        });

        it('calls the handler on an error response with result_code', async () => {
            const handler = vi.fn();
            client = makeClient({
                maxRetry: 0,
                resultCodeHandlers: { FORBIDDEN: handler }
            });
            mockAxios = new MockAdapter(client.axiosIns);

            mockAxios.onGet('/data').reply(403, { result_code: 'FORBIDDEN' });

            // Capture the promise before running timers so any rejection is handled
            const p = client.httpRequestApp.get('/data').catch(() => {});
            await vi.runAllTimersAsync();
            await p;

            expect(handler).toHaveBeenCalledOnce();
        });
    });

    // ── Response interceptor — 5xx retry ─────────────────────────────────────
    describe('response interceptor — 5xx retry', () => {
        it('retries on 5xx and eventually rejects after maxRetry exhausted', async () => {
            client = makeClient({ maxRetry: 2, retryDelay: 0 });
            mockAxios = new MockAdapter(client.axiosIns);

            mockAxios.onGet('/flaky').reply(503, {});

            const p = client.httpRequestApp.get('/flaky').catch((e) => e);
            await vi.runAllTimersAsync();
            const err = await p;

            expect(err.response.status).toBe(503);
            // 1 original + 2 retries = 3 total calls
            expect(mockAxios.history.get.length).toBe(3);
        });

        it('succeeds when a retry returns 200', async () => {
            client = makeClient({ maxRetry: 2, retryDelay: 0 });
            mockAxios = new MockAdapter(client.axiosIns);

            // axios-mock-adapter: chain separate onGet calls for sequential replies
            mockAxios.onGet('/flaky').replyOnce(503, {});
            mockAxios.onGet('/flaky').replyOnce(200, { value: 'recovered' });

            const p = client.httpRequestApp.get('/flaky');
            await vi.runAllTimersAsync();
            const result = await p;

            expect(result).toEqual({ value: 'recovered' });
        });

        it('does not retry on 4xx responses', async () => {
            client = makeClient({ maxRetry: 2, retryDelay: 0 });
            mockAxios = new MockAdapter(client.axiosIns);

            mockAxios.onGet('/bad').reply(400, {});

            const p = client.httpRequestApp.get('/bad').catch((e) => e);
            await vi.runAllTimersAsync();
            await p;

            expect(mockAxios.history.get.length).toBe(1);
        });
    });

    // ── Response interceptor — 401 refresh flow ───────────────────────────────
    describe('response interceptor — 401 token refresh', () => {
        it('calls refreshToken and retries with the new token', async () => {
            const setAccessToken = vi.fn();
            const refreshToken = vi.fn().mockResolvedValue('new-token');

            client = makeClient({ setAccessToken, refreshToken, maxRetry: 0 });
            mockAxios = new MockAdapter(client.axiosIns);

            mockAxios.onGet('/secure').replyOnce(401, {});
            mockAxios.onGet('/secure').replyOnce(200, { ok: true });

            const p = client.httpRequestApp.get('/secure');
            await vi.runAllTimersAsync();
            const result = await p;

            expect(refreshToken).toHaveBeenCalledOnce();
            expect(setAccessToken).toHaveBeenCalledWith('new-token');
            expect(result).toEqual({ ok: true });
        });

        it('calls clearAccessToken and rejects when refreshToken returns no token', async () => {
            const clearAccessToken = vi.fn();
            const refreshToken = vi.fn().mockResolvedValue(null);

            client = makeClient({ clearAccessToken, refreshToken, maxRetry: 0 });
            mockAxios = new MockAdapter(client.axiosIns);

            mockAxios.onGet('/secure').reply(401, {});

            const p = client.httpRequestApp.get('/secure').catch((e) => e);
            await vi.runAllTimersAsync();
            await p;

            expect(clearAccessToken).toHaveBeenCalledOnce();
        });

        it('calls clearAccessToken and rejects when refreshToken throws', async () => {
            const clearAccessToken = vi.fn();
            const refreshToken = vi.fn().mockRejectedValue(new Error('refresh failed'));

            client = makeClient({ clearAccessToken, refreshToken, maxRetry: 0 });
            mockAxios = new MockAdapter(client.axiosIns);

            mockAxios.onGet('/secure').reply(401, {});

            const p = client.httpRequestApp.get('/secure').catch((e) => e);
            await vi.runAllTimersAsync();
            const err = await p;

            expect(clearAccessToken).toHaveBeenCalledOnce();
            expect(err.message).toBe('refresh failed');
        });

        it('does not call refreshToken when it is not provided', async () => {
            client = makeClient({ maxRetry: 0, refreshToken: undefined });
            mockAxios = new MockAdapter(client.axiosIns);

            mockAxios.onGet('/secure').reply(401, {});

            const p = client.httpRequestApp.get('/secure').catch((e) => e);
            await vi.runAllTimersAsync();
            const err = await p;

            expect(err.response.status).toBe(401);
        });
    });

    // ── createApiApp methods ──────────────────────────────────────────────────
    describe('createApiApp — method wrappers', () => {
        beforeEach(() => {
            client = makeClient();
            mockAxios = new MockAdapter(client.axiosIns);
        });

        it('get() returns response.data by default', async () => {
            mockAxios.onGet('/items').reply(200, { items: [1, 2, 3] });

            const p = client.httpRequestApp.get('/items');
            await vi.runAllTimersAsync();
            const result = await p;

            expect(result).toEqual({ items: [1, 2, 3] });
        });

        it('get(url, params, headers, false, true) returns raw response', async () => {
            mockAxios.onGet('/items').reply(200, { items: [] });

            const p = client.httpRequestApp.get('/items', {}, {}, false, true);
            await vi.runAllTimersAsync();
            const result = await p;

            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('status', 200);
        });

        it('get() sets responseType blob when isBlob is true', async () => {
            let capturedConfig;
            mockAxios.onGet('/file').reply((config) => {
                capturedConfig = config;
                return [200, new Blob()];
            });

            const p = client.httpRequestApp.get('/file', {}, {}, true);
            await vi.runAllTimersAsync();
            await p;

            expect(capturedConfig.responseType).toBe('blob');
        });

        it('post() sends data and returns response.data', async () => {
            mockAxios.onPost('/users').reply(201, { id: 99 });

            const p = client.httpRequestApp.post('/users', { name: 'Alice' });
            await vi.runAllTimersAsync();
            const result = await p;

            expect(result).toEqual({ id: 99 });
            expect(mockAxios.history.post[0].data).toBe(JSON.stringify({ name: 'Alice' }));
        });

        it('put() sends data and returns response.data', async () => {
            mockAxios.onPut('/users/1').reply(200, { updated: true });

            const p = client.httpRequestApp.put('/users/1', { name: 'Bob' });
            await vi.runAllTimersAsync();
            const result = await p;

            expect(result).toEqual({ updated: true });
        });

        it('delete() sends request and returns response.data', async () => {
            mockAxios.onDelete('/users/1').reply(200, { deleted: true });

            const p = client.httpRequestApp.delete('/users/1');
            await vi.runAllTimersAsync();
            const result = await p;

            expect(result).toEqual({ deleted: true });
        });
    });
});
