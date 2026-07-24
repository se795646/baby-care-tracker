# frontend-template Architecture Baseline

`frontend-template` is the frontend baseline for:

- bootstrapping new Vue projects with a familiar structure
- giving legacy projects a stable reference when reducing divergence

## Foundation Layers

The template should keep business-neutral foundation code in shared locations:

- `src/foundation/bootstrap`
- `src/foundation/http`
- `src/foundation/router`
- `src/foundation/app`

These layers own the common startup flow, router guard flow, HTTP client behavior, and app-level injected services.

## Required Conventions

### 1. App Bootstrap

- `src/main.js` should use a shared bootstrap helper
- runtime config should be loaded before mount
- runtime config should be injected as `APP_CONFIG`
- plugins should be registered from one place

### 2. Router

- route definitions stay in app code
- auth and permission flow should be configured through a shared router factory
- `token expired` and `no permission` redirects should be event-driven
- route meta is the preferred place for nav, breadcrumb, and permission grouping

### 3. HTTP Client

- all app HTTP clients should be created from a shared factory
- token attachment, retry, refresh, and result-code handling must not be duplicated per project
- project differences should be expressed via callbacks or config

### 4. App Shell Services

- processing dialog
- notice dialog
- toast
- shared refs
- popover helpers

These should be exposed through `provide/inject` from `App.vue`, with a stable interface that legacy projects can gradually adopt.

### 5. Store Shape

The store should keep a stable baseline for cross-project concepts:

- `common`: app-level state
- `personal` or `member`: current user state
- domain modules: business-specific state

Shared lifecycle flags such as `isLogin`, `isInfoReady`, and runtime config derived state should have predictable ownership.

## Adoption Strategy For Legacy Projects

Legacy projects should not copy entire feature folders from the template. They should migrate in this order:

1. bootstrap flow
2. HTTP client
3. router guard flow
4. app shell services
5. store normalization

This keeps business behavior intact while reducing architectural drift.
