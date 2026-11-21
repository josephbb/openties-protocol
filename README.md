# OpenTies Disclosure Policy Protocol

Over the course of a career, researchers accumulate financial and non-financial ties. We take jobs, receive grants, consult, and write papers with colleagues in industry. Whether any of those ties might reasonably be viewed as a conflict of interest depends on the work at hand and on who's asking. A journal might ask about a grant that ended two years ago. A funder reviewing the same researcher's application might care only about support the researcher receives today.

At submission, we usually ask authors to reconstruct that history from memory, read the journal's policy, and work out what belongs in a disclosure statement. The next journal may ask a slightly different question. An author willing to publish a full list of ties can save everyone some work. Others may be quite willing to disclose who funded a particular study while preferring to keep the rest of their professional lives private. Requiring a public list as the price of participation risks losing those authors altogether.

Draft 0.2 describes how one author answers one journal’s policy for one manuscript. The journal supplies the edition of the policy that applies to the submission. A repository of researcher ties, such as [OpenTies.org](https://openties.org/), checks the author’s private record and asks about anything it cannot settle. The author can use the resulting statement in the paper and separately approve a receipt for the editor. The two parties can use different software.

## What does the journal learn?

Suppose a grant supported this paper and the author is still unsure how to answer a separate question about other interests. The editor can already receive **yes**. If the author shares the matches, the editor also learns who funded the work. The editor cannot infer that the list is exhaustive. [Worked example](examples/work.json)

| Answer on the receipt | What the editor can conclude |
| --- | --- |
| Yes (`true`) | At least one tie qualifies or the author answered yes to a disclosure question. |
| No (`false`) | The author completed the review for this policy and submission, and nothing qualified. |
| Unknown (`null`) | The author approved a response, but the available information does not settle the question. |

The author can **share the answer** (`flag`, the default) or **share the answer and confirmed matches** (`matches`). Both identify the submission and policy revision. What an answer reveals depends on the question. If the journal asks only whether Lark paid the author to consult, a yes already tells the editor about that relationship. The author sees the recipient, question and proposed receipt before approving it. Until a receipt arrives, the journal has no approved answer.

## How might this be used?

The journal example runs against the reference implementation. The other two examples explore possible uses beyond this draft.

<a id="worked-example"></a>

<details>
<summary><strong>1. Journal submission. A journal asks about three years of industry ties</strong></summary>

A journal asks authors to disclose research collaborations, funding, and employment involving two companies named in its policy, Lark Computing and Alder Systems. It asks about the three years up to and including submission. For a paper submitted on **20 November 2026**, that takes the author back to **20 November 2023**.

| What the author has on record | Does it belong in this statement? |
| --- | --- |
| Lark funded the author's research in 2024–2025. | Yes. The grant ran during the three years the journal asks about. |
| The author collaborated with researchers at Alder in 2025. | Yes. The rule covers research collaborations, including unpaid work. |
| The author worked for Alder from 2020 to 2022. | No. The job ended before the window opened. |

The author checks all three categories for both companies and confirms the list is complete for that period. The author might put it this way in the paper.

> I received research funding from Lark Computing and collaborated with researchers at Alder Systems. I have no other ties to disclose under the journal's three-year policy.

### What the journal receives

In answer-only mode the editor sees **yes**. In matches mode the editor also sees research funding from Lark and collaboration with Alder. The job that ended in 2022 stays private. [Policy, author input, receipt and reference wording](examples/industry.json)

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

</details>

<details>
<summary><strong>2. Hypothetical court use. A plaintiff asks about a defense expert's prior work</strong></summary>

Suppose Lark retains an expert to testify in a federal civil case about one of its products. After reading the expert's report, the plaintiff's lawyer asks defense counsel a follow-up question: in the five years before the report, did Lark pay the expert to consult or testify about this particular product?

Lark paid the expert to test the product in 2024. The expert also testified at a deposition about a different manufacturer's product in 2025. For a report dated 20 November 2026, the expert could approve the response **“Yes. Paid consulting for Lark Computing.”** Only the consulting work answers this particular question. The deposition in the other case would ordinarily still belong on the retained expert's four-year list of prior testimony under Rule 26. The five-year consulting question is an additional request in this example.

The payment gives counsel a basis to ask about possible bias. It also points to a specific question for the expert's deposition: **“When you tested this product for Lark, did you find conditions under which the method gave inaccurate results?”** Suppose the expert says yes, and those are the very conditions at issue in this case. Counsel now has a concrete reason to ask how the expert accounted for that limitation. If the plaintiff brings a *Daubert* challenge on that ground, the court then decides whether the defense has shown that the opinion rests on sufficient data and reliably applies the method to the facts of this case.

</details>

<details>
<summary><strong>3. Hypothetical funder use. A funder asks about ongoing ties to the companies under study</strong></summary>

A funder invites proposals to compare products made by Lark Computing and Alder Systems. Its eligibility rule says applicants may have **no ongoing research collaboration with, or research funding from, either company on the application date**.

Take the author from the journal example, applying for the grant on the same day. The Lark grant ended in 2025, and the collaboration with Alder also finished that year. The author checks for any other funding or collaboration with either company and confirms there is none. Asked “Do you have a tie covered by this rule?”, the answer is **no**. That answer satisfies this particular eligibility condition. The journal still gets a **yes** from the same record because it asks about the past three years.

If the author and the Alder team are still working together on the application date, the answer becomes **yes**. With approval to share the match, the funder would see **“Ongoing research collaboration with Alder Systems.”** If the records leave the end date open and the applicant hasn't confirmed whether the work continues, the answer is **unknown**. The funder would need that point resolved to establish eligibility.

</details>

## Which organizations count?

A journal can name specific organizations, ask about **any organization of a defined type**, or ask about either. For example, a journal might ask about funding from any for-profit business or registered charity in the past three years. Fern Foundation can qualify even if the journal has never heard of it. A repository that knows only Fern’s name must leave the charity question open until it can establish the answer. [Complete example with an unlisted foundation](examples/sectors.json)

Use the full Research Organization Registry (ROR) URL as the organization ID whenever the entity has a verified ROR record. OpenAlex can help identify an organization from a paper’s affiliation, and a policy can give several verified IDs for the same entity. A journal defines what it means by “charity” or “industry.” A nonprofit label or a similar name is a reason to look more closely. [Organization mapping guide](INTEGRATION.md#mapping-organizations)

## Who sees each document?

| Document | Who uses it |
| --- | --- |
| [Journal policy](schemas/policy.json) | The journal sets the questions, definitions and dates. The author can read the exact revision that applies. |
| [Private input](schemas/input.json) and evaluation | The author’s repository holds the ties, classifications, unresolved questions and rule-by-rule confirmations. |
| Manuscript statement | The author can edit the wording while preserving the scope and certainty of the findings. |
| [Approved receipt](schemas/result.json) | The editor receives the answer and the level of detail the author approved for this submission. |

## Specification and tools

- [Normative specification and versioning](SPEC.md)
- [JSON Schemas](schemas/) (Draft 2020-12, with date and URI format validation)
- [Language-independent conformance cases](conformance/cases.json)
- [Integration guide and prior work](INTEGRATION.md)
- [TypeScript reference implementation](src/index.ts)

Run the suite on Node 22+ with pnpm.

    pnpm install --frozen-lockfile
    pnpm test

The policies and author ties are fictional. The [ROR example](examples/ror.json) uses the University of Michigan’s real registry identifiers. An OpenAlex affiliation ID appears in the private input and the corresponding ROR URL appears in the approved matches receipt. To try other journal policies, see the [funding and consulting example](examples/period.json) and the [example of direct support for a manuscript](examples/work.json).

## FAQ

**Does a reportable tie disqualify an author?** A positive result tells the editor that the journal's disclosure rules cover at least one interest. The journal decides how to handle it.

**Does sharing a receipt give the journal access to my record?** You review the recipient and the exact information you agree to send. The journal receives that receipt. Your other ties and private notes stay in your account.

**What if I need to correct an answer?** You review and approve a new receipt. It has its own ID and identifies the earlier receipt it replaces, so the editor can follow the correction.

### Glossary

| Term | Meaning in this protocol |
| --- | --- |
| **Policy ID** (`policyId`) | The journal's identifier for a particular disclosure policy. The journal example uses `example.industry`. |
| **Policy revision** (`revision`) | The edition of that policy used for the submission. In the journal example, revision `1` asks about the previous 36 months. If the journal changes that period to 60 months, it issues a new revision. The original receipt still refers to revision `1`. |
| **Protocol version** (`protocolVersion`) | The edition of the shared instructions that software uses to read policies and receipts. This draft uses `0.2`. Many journal policies can use the same protocol version. |
| **Submission references** (`submissionId`, `submissionDate`) | Ada and Ben are coauthors on manuscript M123. The journal gives each a separate reference so it can attach each approved answer to the right person. The submission date sets the end of the period under review. Here the journal counts back from 20 November 2026. |
| **Lookback** | How far back the journal asks the author to review their ties. In the example, the 36-month window includes both 20 November 2023 and 20 November 2026. |
| **Completeness attestation** | The author's confirmation that they have reported all ties covered by a particular rule for this submission. It covers the organizations, relationship types and period or manuscript specified by that rule. |
| **Reportable** (`reportable`) | The answer to “Does anything meet this policy?” It is `true` for a confirmed match, `false` when a complete review finds none, and `null` when the information is insufficient to decide. |
| **Receipt mode** (`mode`) | How much detail the author approves for the journal. `flag` gives the overall answer. `matches` also identifies the qualifying ties or affirmative answers. Both modes include the policy and submission references. |
| **Receipt ID** (`receiptId`) | Identifies one approved response. A corrected receipt gets a new ID and uses `supersedes` to identify the earlier receipt. |
