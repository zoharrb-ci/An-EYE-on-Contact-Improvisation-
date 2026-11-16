# Contact Ways Security Specification (Phase 0)

## 1. Data Invariants
1. **Owner-Only Personal Journals**: `/users/{userId}/profile/*`, `/users/{userId}/records/*`, and `/users/{userId}/inquiries/*` may only be read or mutated by the verified authenticated user whose `request.auth.uid == userId`.
2. **Root Super Manager Protection**: `zoharrb@gmail.com` is the immutable root Super Manager and cannot be deleted or demoted from `super_manager`.
3. **Privilege-Gated Curated Content**:
   - `curated_recommendations` and `curated_guides` can only be created or updated by a verified Super Manager or an active Manager with `editRecommendationsAndGuides == true` (or `importTextAndNotebookLM == true` when `sourceType != 'manual'`).
   - `curated_inquiries` can only be created or updated by a verified Super Manager or an active Manager with `editInquiriesAndFlashcards == true` (or `importTextAndNotebookLM == true` when `sourceType != 'manual'`).
   - Deleting curated content requires Super Manager authority.
4. **PII Isolation on Managers List**: `/managers/{managerEmail}` contains email addresses and cannot be listed by non-Super-Managers; individual users may only `get` their own email entry.
5. **Strict Timestamps & Keys**: Every create and update enforces `request.time`, strict allowed keys (`hasAll` + `hasOnly`), bounded strings/arrays, and verified email (`email_verified == true`).

## 2. "Dirty Dozen" Adversarial Payloads (Must All Return PERMISSION_DENIED)
1. Unauthenticated write to `/users/u1/records/rec1`.
2. Verified user `u2` reading or listing `/users/u1/records`.
3. Creating `/users/u1/records/rec1` with mismatched `uid: "u2"` (Identity Spoofing).
4. Updating `/users/u1/records/rec1` with an extra shadow field `isAdmin: true` (Shadow Update).
5. Creating `/users/u1/records/rec1` with client-forged `createdAt` not equal to `request.time`.
6. Unverified email user (`email_verified: false`) attempting to write to `/curated_recommendations/r1` even with a manager email (Email Spoofing).
7. Regular non-manager user creating/updating `/curated_recommendations/r1`.
8. Active manager WITHOUT `editInquiriesAndFlashcards` attempting to write to `/curated_inquiries/inq1` with `sourceType: "manual"`.
9. Active manager attempting to write to `/managers/attacker@example.com` to escalate themselves to `super_manager`.
10. Super Manager attempting to delete `/managers/zoharrb@gmail.com` or change their role to `manager`.
11. Regular user attempting to `list` `/managers` to scrape manager emails (PII Blanket Read).
12. Creating `/curated_recommendations/bad_id_with_1500_chars...` or injecting a 10KB `shortTitle` (Resource Poisoning).
