# OpenTies Disclosure Policy Protocol

Draft 0.1, for individual author disclosures at manuscript submission.

A publisher defines what an author must disclose. For each submission, the author reviews a statement and approves exactly what the journal will receive. The author's private record stays with the evaluating system.

## Worked example

**What the journal asks.** For a manuscript submitted on 20 November 2026, Example Publishing requires authors to disclose research funding or paid consulting from Lark Computing or Fern Foundation during the previous 36 months. Under revision 2 of its policy, the period runs from 20 November 2023 through 20 November 2026, inclusive.

**What the author reports privately.** This walkthrough adds an earlier consulting engagement to the [machine-readable example](examples/period.json) to show how the cutoff works.

| Author's tie | When | Does the journal require it? |
| --- | --- | --- |
| Research funding from Lark Computing | 2024–2025 | Yes. The grant overlaps the disclosure period. |
| Paid consulting for Fern Foundation | 2021 | No. The engagement ended before the period began. |

The author confirms they have listed all funding and consulting covered by this rule. The grant makes the answer **yes**. The author's confirmation, with no outstanding questions, also supports the second sentence of their statement.

> The author reports research funding (Lark Computing). The author declares no other interests reportable under Example Period Policy (revision 2) for this submission.

### What the journal receives

The journal receives a receipt after the author approves it. **`reportable` answers “Is there anything to disclose under this policy?”** The **`mode`** field controls how much detail accompanies that answer. For this author, either mode gives the same result.

| Receipt mode | What the editor learns in this example |
| --- | --- |
| `flag` (default) | **Yes.** At least one interest qualifies. The receipt gives the editor the result, policy revision and submission references. |
| `matches` | **Yes. Research funding from Lark Computing.** The receipt also identifies the rule that matched, the relationship type and the organization. |

The Fern engagement stays private in both modes. The author reads the statement above separately. The receipt itself contains structured fields. [Full example receipt](examples/period.json)

Either mode can return one of three answers.

| `reportable` | How to read it |
| --- | --- |
| `true` | At least one interest qualifies. Even if the author still had another rule to review, the Lark grant would make this **yes**. A “no other interests” statement requires a complete review. |
| `false` | No interest qualifies and the review is complete. This would be the answer if the author had only the 2021 Fern engagement and confirmed the full scope. |
| `null` | The information is insufficient to answer. If the Fern engagement were the only known tie and the author had yet to confirm the full scope, the answer would still be **unknown**. |

<details>
<summary>See the journal rule as JSON</summary>

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

</details>

Some journals also ask whether a grant **supported this manuscript**, regardless of its age. The [submitted-work example](examples/work.json) shows an older grant that qualifies and a separate question the author has yet to answer.

## Reading the schema

| Document | What it means | Fields to look for |
| --- | --- | --- |
| [Journal policy](schemas/policy.json) | What does this journal ask the author to disclose? | `policyId` and `revision` identify the exact policy. Its `rules` say which ties count or ask the author a direct question. |
| [Private author input](schemas/input.json) | What does the author know and affirm for this submission? | `ties` are confirmed relationships. `answers` are specific to this submission. `completeRuleIds` lists the tie rules the author explicitly reviewed for completeness. `unresolvedRuleIds` lists tie rules with outstanding evidence or coverage questions. |
| [Approved receipt](schemas/result.json) | What does the author agree to send this journal? | `reportable` gives the result for the policy and submission. `mode` specifies how much detail the author approved for the journal. |

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
