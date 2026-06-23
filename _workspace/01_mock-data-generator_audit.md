# MockDataGenerator Audit — Applicant Dashboard Mission

**Date:** 2026-06-22  
**Target:** Applicant Dashboard (`/applicant`)

---

## Stage Coverage (Before Changes)

| Stage | Status | SelectionProcess ID | Applicant | Employer |
|---|---|---|---|---|
| `intro_interview` | `active` | `sp3` | `tp-juan` (Juan Herrera) | `ep-acme` (ACME Corp) |
| `technical_interview` | `active` | `sp1` | `tp-sofia` (Sofia Ramirez) | `ep-acme` (ACME Corp) |
| `contract_signing` | `active` | `sp2` | `tp-daniel` (Daniel Torres) | `ep-innova` (InnovaSoft) |

✅ All three required stages are covered by existing data.

---

## Demo User Linkage (Default Applicant Login)

The default demo applicant is **Sofia Ramirez**, linked as:

```
DemoUser: u-sofia (sofia.backend@demo.com)
  → talent_profile_id: tp-sofia
  → profile_id: p-sofia

TalentProfile: tp-sofia
  → user_id: p-sofia
  → current_stage via sp1: technical_interview (active)
  → also has pending interview request ir5 (from ep-innova)

Profile: p-sofia (status: active, role: applicant)
```

---

## InterviewRequest Coverage

| ID | Applicant | Status |
|---|---|---|
| `ir1` | `tp-sofia` | `scheduled` |
| `ir3` | `tp-juan` | `pending` |
| `ir4` | `tp-camila` | `pending` |
| `ir5` | `tp-sofia` | `pending` |

Sofia has both a scheduled interview and a pending one → both states are visible in her dashboard.

---

## Notification Coverage

| ID | User | Type | Read |
|---|---|---|---|
| `n1` | `p-sofia` | `interview` | false |
| `n2` | `p-sofia` | `process` | false |
| `n3` | `p-sofia` | `interview` | true |

2 unread notifications for Sofia ✅

---

## AvailabilitySlots Coverage

Sofia has 3 slots (as1, as2, as3) ✅

---

## Changes Made

**None.** All required data states are fully covered by existing `data/mock.ts`.

---

## Key IDs for @FrontendDev

```
Demo applicant login: sofia.backend@demo.com / Demo123!
TalentProfile ID:     tp-sofia
Profile ID:           p-sofia
Active process:       sp1 (technical_interview, active, ep-acme)
Pending interview:    ir5 (pending, ep-innova)
Scheduled interview:  ir1 (scheduled, ep-acme)
Also demo:            tp-juan → sp3 (intro_interview), tp-daniel → sp2 (contract_signing)
```
