---
name: mock-data-generator
description: "VeneHire mock data audit and injection skill. Use when: verifying that data/mock.ts covers all SelectionProcess stages (intro_interview, technical_interview, contract_signing), adding missing candidate profiles, ensuring DemoUser/TalentProfile/Notification/AvailabilitySlot linkage is coherent, or preparing data states for @FrontendDev. Also triggers on: 'check mock data', 'add mock candidate', 'seed data for dashboard', 'update mock states', re-run or re-audit data layer."
---

# MockDataGenerator Skill — VeneHire

Ensures `data/mock.ts` has complete, type-safe mock data covering all required UI states.

## What to Audit

Read `data/mock.ts` and verify:

1. **Stage coverage** — `mockSelectionProcesses` must have at least one record per stage:
   - `intro_interview` with `status: 'active'`
   - `technical_interview` with `status: 'active'`
   - `contract_signing` with `status: 'active'` and a non-null `contract_status`

2. **Profile linkage** — Each active process must have:
   - A `TalentProfile` with a `user_id` that matches a `Profile.id`
   - A `DemoUser` with a `talent_profile_id` matching that `TalentProfile.id`

3. **InterviewRequest coverage** — At least one `InterviewRequest` per active applicant in states `pending`, `scheduled`, and `completed`.

4. **Notifications** — At least 2 unread notifications per active applicant (`user_id` = their `Profile.id`).

5. **AvailabilitySlots** — At least 2 slots per applicant who is in `intro_interview` or `technical_interview` stage.

## ID Conventions

Follow existing ID patterns:
- TalentProfile: `tp-{name}` (e.g., `tp-sofia`)
- Profile: `p-{name}` (e.g., `p-sofia`)
- DemoUser: `u-{name}` (e.g., `u-sofia`)
- SelectionProcess: `sp{N}`
- InterviewRequest: `ir{N}`
- Notification: `n{N}`
- AvailabilitySlot: `as{N}`
- Skill: `s{N}`

Never reuse an existing ID. Increment from the highest existing number.

## Adding Data

Only add what is missing. Do not modify existing records unless there is a type mismatch.

```ts
// ponytail: minimal record — only fields required by SelectionProcess interface
{ id: 'sp6', applicant_id: 'tp-new', employer_id: 'ep-acme', role_title: 'Role', current_stage: 'intro_interview', status: 'active', intro_interview_date: '2024-05-01T10:00:00Z', technical_interview_date: null, contract_status: null, notes: '', created_at: '2024-05-01' }
```

## Output

Write audit results to `_workspace/01_mock-data-generator_audit.md`:

```markdown
## MockDataGenerator Audit

### Before Changes
- intro_interview: covered by sp3 (tp-juan)
- technical_interview: covered by sp1 (tp-sofia)
- contract_signing: covered by sp2 (tp-daniel)

### Changes Made
- None / Added tp-new, sp6, ir6, n12, n13, as7, as8

### IDs Used
List any new IDs introduced.
```
