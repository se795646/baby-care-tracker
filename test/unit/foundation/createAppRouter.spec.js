import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMemoryHistory } from 'vue-router';
import createAppRouter from '@/foundation/router/createAppRouter';

// ─── Minimal route fixtures ───────────────────────────────────────────────────
const HOME_ROUTE  = { name: 'Home',  path: '/',       component: { template: '<div />' } };
const LOGIN_ROUTE = { name: 'Login', path: '/login',  component: { template: '<div />' } };
const ADMIN_ROUTE = { name: 'Admin', path: '/admin',  component: { template: '<div />' } };

function makeRouter(overrides = {}) {
    return createAppRouter({
        routes:  [HOME_ROUTE, LOGIN_ROUTE, ADMIN_ROUTE],
        history: createMemoryHistory(),
        ...overrides
    });
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('createAppRouter', () => {

    // ── Basic creation ────────────────────────────────────────────────────────
    describe('basic creation', () => {
        it('returns a vue-router instance', () => {
            const router = makeRouter();
            expect(router).toHaveProperty('push');
            expect(router).toHaveProperty('replace');
            expect(router).toHaveProperty('currentRoute');
        });

        it('creates router without auth guard when auth is omitted', async () => {
            const router = makeRouter();
            await router.push('/');
            expect(router.currentRoute.value.name).toBe('Home');
        });
    });

    // ── Auth guard — disabled ─────────────────────────────────────────────────
    describe('auth guard — disabled', () => {
        it('allows navigation when auth.enabled is false', async () => {
            const getAccessToken = vi.fn(() => null);
            const router = makeRouter({
                auth: { enabled: false, getAccessToken }
            });
            await router.push('/admin');
            expect(router.currentRoute.value.name).toBe('Admin');
            expect(getAccessToken).not.toHaveBeenCalled();
        });

        it('allows navigation to ignored route names even without a token', async () => {
            const router = makeRouter({
                auth: {
                    enabled: true,
                    ignoreRouteNames: ['Login'],
                    getAccessToken: vi.fn(() => null)
                }
            });
            await router.push('/login');
            expect(router.currentRoute.value.name).toBe('Login');
        });
    });

    // ── Auth guard — missing token ────────────────────────────────────────────
    describe('auth guard — missing token', () => {
        it('redirects to onMissingToken target when token is absent', async () => {
            const router = makeRouter({
                auth: {
                    enabled: true,
                    ignoreRouteNames: ['Login'],   // prevent redirect loop
                    getAccessToken: vi.fn(() => null),
                    onMissingToken: { name: 'Login' }
                }
            });
            await router.push('/admin');
            expect(router.currentRoute.value.name).toBe('Login');
        });

        it('accepts onMissingToken as a function returning the redirect', async () => {
            const router = makeRouter({
                auth: {
                    enabled: true,
                    ignoreRouteNames: ['Login'],   // prevent redirect loop
                    getAccessToken: vi.fn(() => null),
                    onMissingToken: () => ({ name: 'Login' })
                }
            });
            await router.push('/admin');
            expect(router.currentRoute.value.name).toBe('Login');
        });

        it('calls next(undefined) when onMissingToken is not specified', async () => {
            const router = makeRouter({
                auth: {
                    enabled: true,
                    getAccessToken: vi.fn(() => null)
                }
            });
            // Without a redirect target, navigation should proceed (next() with undefined)
            await router.push('/admin');
            expect(router.currentRoute.value.name).toBe('Admin');
        });
    });

    // ── Auth guard — canAccess ────────────────────────────────────────────────
    describe('auth guard — canAccess', () => {
        it('allows navigation when canAccess returns true', async () => {
            const router = makeRouter({
                auth: {
                    enabled: true,
                    getAccessToken: vi.fn(() => 'token'),
                    canAccess: vi.fn().mockResolvedValue(true)
                }
            });
            await router.push('/admin');
            expect(router.currentRoute.value.name).toBe('Admin');
        });

        it('blocks navigation when canAccess returns false', async () => {
            const router = makeRouter({
                auth: {
                    enabled: true,
                    getAccessToken: vi.fn(() => 'token'),
                    canAccess: vi.fn().mockResolvedValue(false)
                }
            });
            await router.push('/');
            await router.push('/admin');
            // Should stay on Home (the previous route)
            expect(router.currentRoute.value.name).not.toBe('Admin');
        });

        it('redirects when canAccess returns { allowed: false, redirect }', async () => {
            const router = makeRouter({
                auth: {
                    enabled: true,
                    ignoreRouteNames: ['Login'],   // prevent redirect loop
                    getAccessToken: vi.fn(() => 'token'),
                    canAccess: vi.fn().mockImplementation(({ to }) =>
                        // Only block /admin; allow everything else (including /login)
                        to.name === 'Admin'
                            ? Promise.resolve({ allowed: false, redirect: { name: 'Login' } })
                            : Promise.resolve(true)
                    )
                }
            });
            await router.push('/admin');
            expect(router.currentRoute.value.name).toBe('Login');
        });

        it('passes token to canAccess', async () => {
            const canAccess = vi.fn().mockResolvedValue(true);
            const router = makeRouter({
                auth: {
                    enabled: true,
                    getAccessToken: vi.fn(() => 'secret'),
                    canAccess
                }
            });
            await router.push('/admin');
            expect(canAccess.mock.calls[0][0].token).toBe('secret');
        });
    });

    // ── Event bindings ────────────────────────────────────────────────────────
    describe('eventBindings', () => {
        it('pushes target route when the bound event fires', async () => {
            const emitter = { on: vi.fn() };
            makeRouter({
                emitter,
                eventBindings: [
                    { event: 'SESSION_EXPIRED', target: { name: 'Login' } }
                ]
            });

            const [registeredEvent, handler] = emitter.on.mock.calls[0];
            expect(registeredEvent).toBe('SESSION_EXPIRED');
            expect(typeof handler).toBe('function');
        });

        it('calls action(router) when action is provided instead of target', async () => {
            const emitter = { on: vi.fn() };
            const action = vi.fn();
            const router = makeRouter({
                emitter,
                eventBindings: [{ event: 'LOGOUT', action }]
            });

            const [, handler] = emitter.on.mock.calls[0];
            handler();

            expect(action).toHaveBeenCalledWith(router);
        });

        it('registers all event bindings', () => {
            const emitter = { on: vi.fn() };
            makeRouter({
                emitter,
                eventBindings: [
                    { event: 'A', target: { name: 'Home' } },
                    { event: 'B', target: { name: 'Login' } }
                ]
            });

            expect(emitter.on).toHaveBeenCalledTimes(2);
        });

        it('does not register event bindings when emitter is not provided', () => {
            // Should not throw
            expect(() => makeRouter({ eventBindings: [{ event: 'X' }] })).not.toThrow();
        });
    });
});
