---
name: venehire-orchestrator
description: "VeneHire dashboard development orchestrator. Use when: building a new dashboard view, improving an existing dashboard, coordinating data and UI work for any role (applicant, employer, admin, student, client), or requesting 'build applicant dashboard', 'improve employer view', 'add section to admin panel', or any variation. Also triggers on: re-run, update, fix dashboard, re-build, improve view, previous result, redo UI. Always syncs with develop before generating code."
---

# VeneHire Orchestrator

Coordinates @MockDataGenerator and @FrontendDev to build VeneHire role-based dashboard views.

## Execution Mode: Pipeline (Sequential Subagents)

```
[Orchestrator]
    ├── invoke_subagent(MockDataGenerator) → _workspace/01_mock-data-generator_audit.md
    └── invoke_subagent(FrontendDev)       → app/(dashboard)/{role}/page.tsx
                                             _workspace/02_frontend-dev_summary.md
```

## Subagent Configuration

| TypeName | Role | Skill | Output |
|---|---|---|---|
| `MockDataGenerator` | Verify & inject mock data | `mock-data-generator` | `_workspace/01_mock-data-generator_audit.md` |
| `FrontendDev` | Build dashboard page | `frontend-dev` | `app/(dashboard)/{role}/page.tsx`, `_workspace/02_frontend-dev_summary.md` |

## Workflow

### Phase 0: Context Check

Check `_workspace/` existence:
- **Missing** → initial run, proceed to Phase 1
- **Present + partial re-run request** → call only the relevant subagent, pass existing workspace files
- **Present + new target** → backup `_workspace/` to `_workspace_{timestamp}/`, fresh run

### Phase 1: Sync

**MANDATORY before any code generation or commit.**

Run: `git fetch origin develop && git merge origin/develop --no-edit`

If the merge fails (conflicts), stop and report to the user before proceeding.

Create `_workspace/` directory.

### Phase 2: Data Verification (MockDataGenerator)

`invoke_subagent` with TypeName `MockDataGenerator`:

```
Read types/index.ts and data/mock.ts.
Audit that mockSelectionProcesses has active records in stages:
  - intro_interview
  - technical_interview
  - contract_signing
Verify all profile linkages (DemoUser → TalentProfile → Profile).
Add the minimum missing records, following ID conventions in the skill.
Write audit report to _workspace/01_mock-data-generator_audit.md.
```

### Phase 3: UI Build (FrontendDev)

`invoke_subagent` with TypeName `FrontendDev`:

```
Read _workspace/01_mock-data-generator_audit.md to know available data states.
Read app/(dashboard)/{role}/page.tsx (current state).
Read components/ directory listing.
Build the dashboard page consuming useMockData() and useDemoAuth().
Target: show active SelectionProcesses with ProcessTimeline, 
        pending InterviewRequests, profile details (english_level, 
        availability_status, tech_stack), KPI stat cards, and notifications.
Write final page to app/(dashboard)/{role}/page.tsx.
Write summary to _workspace/02_frontend-dev_summary.md.
```

### Phase 4: Integration Check

Read both workspace output files. Verify:
- The audit report confirms all three process stages are covered
- The FrontendDev summary lists the page and components used

Report to user: files changed, stages covered, components reused.

### Phase 5: Commit Prompt

Remind the user to run `sync-dev.sh` (or the equivalent git fetch/merge) before committing if time has passed since Phase 1.

## Error Handling

| Situation | Action |
|---|---|
| MockDataGenerator fails | Retry once. If still failing, skip and pass existing mock.ts to FrontendDev |
| FrontendDev fails | Retry once with more specific context. Report failure with partial output |
| Merge conflict in Phase 1 | Stop immediately, report conflicting files to user |
| Missing `_workspace/` audit file | FrontendDev reads `data/mock.ts` directly as fallback |

## Test Scenarios

### Normal flow
1. User: "build applicant dashboard"
2. Phase 1: sync succeeds
3. MockDataGenerator: confirms sp1 (technical), sp2 (contract), sp3 (intro) — no additions needed
4. FrontendDev: updates `app/(dashboard)/applicant/page.tsx` showing all three states
5. Summary reported to user

### Error flow
1. MockDataGenerator fails on first run
2. Retry with simplified prompt
3. On second failure: FrontendDev reads `data/mock.ts` directly
4. Report: "MockDataGenerator skipped — data verified manually"
