# AGENTS.md — VeneHire

## Harness: venehire

**Goal:** Coordinate mock data generation and dashboard UI development for VeneHire role-based dashboards under a pipeline of specialized subagents.

**Trigger:** When asked to build, improve, or fix any dashboard view in `app/(dashboard)/`, run `sync-dev.sh` first, then use the `venehire-orchestrator` skill. Simple questions can be answered directly.

**Change History:**

| Date | Change | Target | Reason |
|---|---|---|---|
| 2026-06-22 | Initial setup | Full harness | New project — no prior harness |
