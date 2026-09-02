# WEB-allan-titin-danse-2-vivre

Created 2026-08-27T09:31:24Z via ShikkiMonitor scaffolder.

## Process

Under the Shikki umbrella — pipelines (`/quick`, `/spec`, `/pre-pr`, `/review`,
`/ultrareview`) are active in every session. TDD by default. No code without a
green test.

## Conventions

- Match the conventions of neighbouring files before introducing new ones.
- Don't add error handling, fallbacks, or validation for scenarios that can't
  happen. Trust internal code and framework guarantees.
- Default to writing no comments. Only add one when the WHY is non-obvious.

## Memory

Project memory lives under `~/.claude/projects/-Users-pro--shikki-workspaces-personal-projects-WEB-allan-titin-danse-2-vivre/memory/`.
Save user/feedback/project/reference memories there as you learn things.

## Wired

- `.mcp.json` — Shikki MCP server (shikki-db) + shi mcp-serve
- SessionStart hooks fire on `claude` launch (global + project)
- moto ingests transcripts on session close
- SessionReceipt persisted at `~/.shikki/session-receipts/`

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
