---
name: frontend-dev
description: "VeneHire dashboard UI development skill. Use when: building or improving pages in app/(dashboard)/, implementing role-specific views (applicant, employer, admin, student, client), consuming mock data states from useData() context, adding ProcessTimeline, StatCard, or other existing components to a page, or fixing dashboard layout/display issues. Also triggers on: 'build dashboard', 'design view', 'add section to dashboard', 'fix UI', re-run or update any dashboard page."
---

# FrontendDev Skill — VeneHire

Builds and refines dashboard pages in `app/(dashboard)/` using Next.js 13.5 and existing project components.

## Before Writing Code

1. Read `_workspace/01_mock-data-generator_audit.md` — understand which data states and IDs are available.
2. Read the existing page file (if any) — do not overwrite working logic blindly.
3. `list_dir` the `components/` folder — check what reusable components exist.

## Component Inventory (as of setup)

| Component | Usage |
|---|---|
| `StatCard` | KPI numbers with icon and label |
| `ProfileCompletionCard` | Progress ring + checklist |
| `ProcessTimeline` | Visual stage tracker for SelectionProcess |
| `ProcessStatusBadge` | Color-coded status pill |
| `RoleBadge` | Displays a role or status as a badge |
| `NotificationCenter` | Full notification panel |
| `InterviewRequestModal` | Modal for creating interview requests |
| `TalentCard` | Candidate card for listings |
| `SkillBar` | Horizontal skill score bar |
| `SectionHeader` | Consistent section title |
| `EmptyState` | Placeholder for empty lists |
| `StatCard` | Metric card with icon |

All `shadcn/ui` primitives are in `components/ui/`.

## Page Structure Pattern

```tsx
'use client'; // only if using hooks

import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/demo-auth';
// Import only what is used

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { selectionProcesses, interviewRequests } = useData();

  // Derive data — ponytail: useMemo only when filtering large arrays
  const myProcesses = selectionProcesses.filter(p => p.applicant_id === talentProfileId);

  return (
    <div className="space-y-8">
      {/* Header */}
      {/* Stat Cards grid */}
      {/* Main content 2-col grid */}
      {/* Sidebar */}
    </div>
  );
}
```

## Layout Grid Conventions

- Top stats: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`
- Main + sidebar: `grid grid-cols-1 lg:grid-cols-3 gap-6` (main spans 2 cols)
- Cards: `bg-white rounded-2xl border border-gray-100 p-5`

## Empty State Pattern

```tsx
<div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
  <p className="text-sm text-muted-foreground">No active processes yet.</p>
</div>
```

## Output

1. Write the final page to `app/(dashboard)/{role}/page.tsx`.
2. Write summary to `_workspace/02_frontend-dev_summary.md`.
