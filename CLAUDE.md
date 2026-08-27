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
