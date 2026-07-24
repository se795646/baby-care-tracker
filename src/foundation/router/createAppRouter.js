import { createRouter, createWebHashHistory } from 'vue-router';

function resolveTarget(target, context) {
    if (!target) {
        return null;
    }

    return typeof target === 'function' ? target(context) : target;
}

export default function createAppRouter({
    routes,
    history = createWebHashHistory(import.meta.env.BASE_URL),
    auth,
    emitter,
    eventBindings = []
}) {
    const router = createRouter({
        history,
        routes
    });

    if (auth) {
        const {
            enabled = true,
            ignoreRouteNames = [],
            getAccessToken = () => null,
            onMissingToken,
            canAccess
        } = auth;

        router.beforeEach(async (to, from, next) => {
            if (!enabled || ignoreRouteNames.includes(to.name)) {
                next();
                return;
            }

            const token = await getAccessToken({ to, from, router });

            if (!token) {
                const redirectTarget = resolveTarget(onMissingToken, {
                    to,
                    from,
                    router
                });

                next(redirectTarget || undefined);
                return;
            }

            if (canAccess) {
                const guardResult = await canAccess({
                    to,
                    from,
                    router,
                    token
                });

                if (guardResult === false) {
                    next(false);
                    return;
                }

                if (guardResult?.allowed === false) {
                    next(
                        resolveTarget(guardResult.redirect, {
                            to,
                            from,
                            router
                        })
                    );
                    return;
                }
            }

            next();
        });
    }

    if (emitter) {
        eventBindings.forEach(({ event, target, action }) => {
            emitter.on(event, () => {
                if (action) {
                    action(router);
                    return;
                }

                const nextTarget = resolveTarget(target, { router });
                if (nextTarget) {
                    router.push(nextTarget);
                }
            });
        });
    }

    return router;
}
