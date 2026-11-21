# OpenTies Disclosure Policy Protocol

Over the course of a career, researchers accumulate financial and non-financial ties. We take jobs, receive grants, consult, and write papers with colleagues in industry. Whether any of those ties might reasonably be viewed as a conflict of interest depends on the work at hand and on who's asking. A journal might ask about a grant that ended two years ago. A funder reviewing the same researcher's application might care only about support the researcher receives today.

At submission, we usually ask authors to reconstruct that history from memory, read the journal's policy, and work out what belongs in a disclosure statement. The next journal may ask a slightly different question. An author willing to publish a full list of ties can save everyone some work. Others may be quite willing to disclose who funded a particular study while preferring to keep the rest of their professional lives private. Requiring a public list as the price of participation risks losing those authors altogether.

OpenTies is a proposal for handling that exchange. A requester, such as a journal, funder, or employer, maintains a policy and can issue a new revision when its requirements change. The researcher's software checks their private record against the applicable revision and asks them about anything the record can't settle. The researcher reviews the answer and approves what the requester will see. The requester gets an answer to its own question and decides what to do with it. The policy and response use a common format, so the two parties can use different platforms and programming languages.

## How might this be used?

Draft 0.1 covers authors submitting manuscripts to journals. The first example runs against the reference implementation. The next two are worked hypotheticals showing how the same approach might be useful in litigation and grant review.

<a id="worked-example"></a>

### 1. A journal asks about three years of industry ties

A journal asks authors to disclose research collaborations, funding, and employment involving two companies named in its policy, Lark Computing and Alder Systems. It asks about the three years up to and including submission. For a paper submitted on **20 November 2026**, that takes the author back to **20 November 2023**.

| What the author has on record | Does it belong in this statement? |
| --- | --- |
| Lark funded the author's research in 2024–2025. | Yes. The grant ran during the three years the journal asks about. |
| The author collaborated with researchers at Alder in 2025. | Yes. The rule covers research collaborations, including unpaid work. |
| The author worked for Alder from 2020 to 2022. | No. The job ended before the window opened. |

The author checks all three categories for both companies and confirms the list is complete for that period. The author could use this statement in the paper.

> I received research funding from Lark Computing and collaborated with researchers at Alder Systems. I have no other ties to disclose under the journal's three-year policy.

### What the journal receives

The author can share that statement with the paper. Separately, the journal's software can receive a **receipt** for this submission. The author sees who will receive it and approves the level of detail. Both modes answer the same question. Does the author have anything to disclose under this policy?

| Mode | What the editor receives in this case |
| --- | --- |
| `flag` (the default) | **Yes.** At least one tie meets the rule. |
| `matches` | **Yes.** Research funding from Lark Computing and research collaboration with Alder Systems. |

Both receipts identify the submission and the policy revision. Neither lists the earlier job at Alder. One confirmed grant is enough for a **yes** (`true`), even if another question is open. A **no** (`false`) requires a complete review that found no qualifying ties. If the author has yet to establish either answer, the result is **unknown** (`null`). [Full journal policy, private input, generated statement and receipt](examples/industry.json) · [Glossary](#glossary)

<details>
<summary>See the journal rule as JSON</summary>

```json
{
  "id": "industry",
  "label": "Research funding, research collaboration or employment involving a listed company in the past 36 months",
  "kind": "ties",
  "relationshipTypes": [
    "research_funding",
    "collaboration",
    "employment"
  ],
  "organizationIds": [
    "example:lark",
    "example:alder"
  ],
  "window": {
    "kind": "lookback",
    "months": 36
  }
}
```

</details>

### 2. A plaintiff asks about a defense expert's prior work

Suppose a plaintiff's lawyer is considering a *Daubert* challenge to expert testimony about a Lark product. The lawyer wants to know whether, in the five years before the expert's report, Lark paid the witness to consult or give expert testimony about that product.

Suppose Lark paid the witness in 2024 to evaluate the product using the same test method discussed in the report. In 2025 the witness also testified in a dispute involving a different manufacturer. For a report dated 20 November 2026, the consulting engagement falls within the requested period and concerns the named product. The testimony in the other dispute concerns a different company and falls outside the request.

With the witness's approval, a detailed response could say **“Yes. Paid consulting for Lark Computing.”** Counsel could then ask whether that work involved the test method used in the report and, if so, what the expert learned about its reliability. A fee may bear on bias. The court considering admissibility must separately assess the basis and reliability of the testimony under Rule 702. The five-year period here is the lawyer's hypothetical request. [Federal Rules of Evidence, Rule 702](https://www.uscourts.gov/forms-rules/current-rules-practice-procedure/federal-rules-evidence)

### 3. A funder asks about ongoing ties to the companies under study

A funder invites proposals to compare products made by Lark Computing and Alder Systems. Its eligibility rule says applicants may have **no ongoing research collaboration with, or research funding from, either company on the application date**.

Take the author from the journal example, applying for the grant on the same day. The Lark grant ended in 2025, and the collaboration with Alder also finished that year. The author checks for any other funding or collaboration with either company and confirms there is none. Asked “Do you have a tie covered by this rule?”, the answer is **no**. That answer satisfies this particular eligibility condition. The journal still gets a **yes** from the same record because it asks about the past three years.

If the author and the Alder team are still working together on the application date, the answer becomes **yes**. With approval to share the match, the funder would see **“Ongoing research collaboration with Alder Systems.”** If the records leave the end date open and the applicant hasn't confirmed whether the work continues, the answer is **unknown**. The funder would need that point resolved to establish eligibility.

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

The examples use fictional organizations. To try other journal policies, see the [funding and consulting example](examples/period.json) and the [example of direct support for a manuscript](examples/work.json).

## FAQ

**Does a reportable tie disqualify an author?** A positive result tells the editor that the journal's disclosure rules cover at least one interest. The journal decides how to handle it.

**Does sharing a receipt give the journal access to my record?** You review the recipient and the exact information you agree to send. The journal receives that receipt. Your other ties and private notes stay in your account.

**What if I need to correct an answer?** You review and approve a new receipt. It has its own ID and identifies the earlier receipt it replaces, so the editor can follow the correction.

### Glossary

| Term | Meaning in this protocol |
| --- | --- |
| **Policy ID** (`policyId`) | The journal's identifier for a particular disclosure policy. The journal example uses `example.industry`. |
| **Policy revision** (`revision`) | The edition of that policy used for the submission. In the journal example, revision `1` asks about the previous 36 months. If the journal changes that period to 60 months, it issues a new revision. The original receipt still refers to revision `1`. |
| **Protocol version** (`protocolVersion`) | The edition of the shared instructions that software uses to read policies and receipts. This draft uses `0.1`. Many journal policies can use the same protocol version. |
| **Submission references** (`submissionId`, `submissionDate`) | The ID tells the receiving journal which author's submission the answer belongs to, such as `author-copy-001`. The submission date sets the end of the period under review. Here the journal counts back from 20 November 2026. |
| **Lookback** | How far back the journal asks the author to review their ties. In the example, the 36-month window includes both 20 November 2023 and 20 November 2026. |
| **Completeness attestation** | The author's confirmation that they have reported all ties covered by a particular rule for this submission. It covers the organizations, relationship types and period or manuscript specified by that rule. |
| **Reportable** (`reportable`) | The answer to “Does anything meet this policy?” It is `true` for a confirmed match, `false` when a complete review finds none, and `null` when the information is insufficient to decide. |
| **Receipt mode** (`mode`) | How much detail the author approves for the journal. `flag` gives the overall answer. `matches` also identifies the qualifying ties or affirmative answers. Both modes include the policy and submission references. |
| **Receipt ID** (`receiptId`) | Identifies one approved response. A corrected receipt gets a new ID and uses `supersedes` to identify the earlier receipt. |
