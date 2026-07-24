# Repo Rules

## Container-First Node Workflow

If this project has an available Docker Compose service or running container,
all Node-related operations must be executed inside the container instead of on
the host machine.

This includes:

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run test:*`
- `node ...`
- `vite ...`
- `vitest ...`
- other package-manager or JavaScript runtime commands

Only source inspection tasks such as reading files, searching code, and
reviewing diffs may run directly on the host.

## Default Container For This Repo

Use the Compose service defined in the parent compose file:

- compose file: `../docker-compose.yml`
- service: `frontend-template`
- current container name: `projects-frontend-template-1`

## Preferred Command Pattern

Run Node commands like this:

```bash
docker exec projects-frontend-template-1 bash -lc 'cd /usr/src/app && npm run lint'
```

Or:

```bash
docker compose -f ../docker-compose.yml exec frontend-template bash -lc 'cd /usr/src/app && npm run dev -- --host 0.0.0.0 --port 5173'
```

## Host Fallback

Do not run Node commands on the host unless:

- the container is unavailable
- the Compose service is missing
- the task explicitly requires host execution

When falling back to host execution, state the reason first.
