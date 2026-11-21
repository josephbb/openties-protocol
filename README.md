# OpenTies Disclosure Policy Protocol

Draft 0.1, for individual author disclosures at manuscript submission.

A publisher defines what an author must report. An implementation applies those rules to confirmed relationships and submission-specific answers, shows the author a statement, and can issue an approved receipt to the journal. A journal can request a flag alone or the matching items. The author's private record stays with the evaluating system.

## Reading the schema

| Document | What it means | Fields to look for |
| --- | --- | --- |
| [Journal policy](schemas/policy.json) | What does this journal ask the author to disclose? | `policyId` and `revision` identify the exact policy. Its `rules` say which ties count or ask the author a direct question. |
| [Private author input](schemas/input.json) | What does the author know and affirm for this submission? | `ties` are confirmed relationships. `answers` are specific to this submission. `completeRuleIds` lists the tie rules the author explicitly reviewed for completeness. `unresolvedRuleIds` lists tie rules with outstanding evidence or coverage questions. |
| [Approved receipt](schemas/result.json) | What does the author agree to send this journal? | `reportable` gives the result for the policy and submission. With `mode: "flag"` the journal receives the result and identifying references. With `mode: "matches"` it also receives the matching items. |

### A journal rule in practice

> Disclose any research funding or paid consulting from Lark Computing or Fern Foundation during the 36 months ending on the submission date.

Here is that rule as it appears in the policy. The policy gives each organization and relationship type a stable ID so the rule can refer to it by name across systems.

```json
{
  "id": "period",
  "label": "Funding and consulting from the two listed organizations in the past 36 months",
  "kind": "ties",
  "relationshipTypes": ["research_funding", "consulting"],
  "organizationIds": ["example:lark", "example:fern"],
  "window": {"kind": "lookback", "months": 36}
}
```

For a submission on **20 November 2026**, the window runs from **20 November 2023 through 20 November 2026**, inclusive. A Lark research grant held in 2024–2025 falls inside it. The author can report the grant immediately. To declare “no other interests” under this policy, the author must also confirm they have reported all funding and consulting covered by the rule, with any uncertainties resolved. [Full example with statement and receipt](examples/period.json)

| `reportable` | How the editor should read it |
| --- | --- |
| `true` | At least one interest meets the policy. Other questions may still be open. |
| `false` | Every rule is complete and no interest meets the policy. |
| `null` | There is too little information to tell. |

Some journals also ask whether a grant **supported this manuscript**, regardless of its age. A `submitted-work` window captures that distinction. An `author-question` lets the journal ask about other interests that require the author's judgment. [Worked example with an older grant and an unanswered question](examples/work.json)

## Specification and tools

- [Normative specification and versioning](SPEC.md)
- [JSON Schemas](schemas/) (Draft 2020-12, with date and URI format validation)
- [Language-independent conformance cases](conformance/cases.json)
- [Integration guide and prior work](INTEGRATION.md)
- [TypeScript reference implementation](src/index.ts)

Run the suite on Node 22+ with pnpm.

    pnpm install --frozen-lockfile
    pnpm test

The package builds with its own lockfile. The examples contain fictional journals and organizations. Draft 0.1 is available for local integration and evaluation.
