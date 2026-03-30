# White Label Food Ordering Storefront

Production-style starter for a multi-tenant food-ordering storefront on `Next.js App Router + TypeScript`.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui-compatible component layer
- TanStack Query
- Zustand
- React Hook Form + Zod
- react-i18next
- ESLint + Prettier
- Vitest + React Testing Library
- Playwright
- pnpm

## Run

1. Install `pnpm` locally if it is not available yet.
2. Copy `.env.example` into `.env.local`.
3. Install dependencies: `pnpm install`
4. Start dev server: `pnpm dev`

Useful scripts:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm format`
- `pnpm test:unit`
- `pnpm test:e2e`

## Architecture

The project follows a feature-first / sliced-style structure with explicit layer boundaries.

```text
src/
  app/        -> routing, layouts, providers, page composition
  processes/  -> orchestration for tenant/locale bootstrap
  widgets/    -> large UI blocks composed from features/entities/shared
  features/   -> user scenarios and use cases
  entities/   -> domain models, DTOs, mappers, entity-local state
  shared/     -> reusable ui, api, config, hooks, lib, i18n, types
  store/      -> cross-cutting UI state
tests/        -> Vitest and Playwright setup
```

Dependency rules encoded in ESLint:

- `app` can depend on all lower layers.
- `widgets` can depend on `features`, `entities`, `shared`, `store`.
- `features` can depend on `entities`, `shared`, `store`.
- `entities` can depend only on `shared`.
- `shared` cannot import higher layers.
- `processes` orchestrate tenant/locale bootstrap and do not depend on `widgets` or `app`.

## Multi-tenant / White Label

Tenant and locale are resolved from route params:

- `src/app/[tenant]/[locale]/...`

White-label setup is prepared through:

- `src/entities/tenant/config/tenant-config.ts`
- `src/features/tenant-theme/ui/tenant-theme-provider.tsx`
- CSS variables in `src/app/styles/globals.css`

Per-tenant config controls:

- `title`
- `description`
- `logoText`
- theme colors
- radius
- restaurant metadata

## API Integration Boundary

Frontend does not embed backend business rules.

Spring Boot integration is prepared via:

- `src/shared/api/http-client.ts` -> typed fetch wrapper
- `src/shared/api/server-auth.ts` -> auth headers / cookie forwarding for server requests
- `src/shared/config/env.ts` -> env-safe API config
- `src/features/menu-catalog/api/get-menu-catalog.ts`
- `src/features/order-tracking/api/get-order-tracking.ts`

Current default mode is mocked:

- `NEXT_PUBLIC_API_MOCKING=enabled`

To switch to real backend calls:

1. Set `NEXT_PUBLIC_API_MOCKING=disabled`
2. Point `NEXT_PUBLIC_API_BASE_URL` to Spring Boot API
3. Replace placeholder request paths with final backend endpoints if needed

## What Is Ready For Spring Boot

- Central API base URL via env
- Typed request wrapper with JSON/error handling
- Support for `Authorization` and forwarded cookies
- DTO -> domain mappers for entity boundaries
- Menu catalog use case prepared for tenant-aware API calls
- Order tracking use case prepared for client-side polling
- Checkout form prepared to send a typed payload later

## Notes

- `components.json` and `src/shared/ui/*` provide a shadcn/ui-compatible setup adapted to the project structure.
- `store/ui-store.ts` is reserved for cross-cutting UI state only.
- `entities/cart` owns cart state and selectors, while `features/*` own user interactions around it.
