# Author disclosure protocol 0.1

The three JSON Schemas define the wire objects. The rules below define their meaning. Implementations must validate structure, formats, identifiers and dates before evaluation. Invalid or unsupported input is an error. A valid policy with insufficient evidence yields an indeterminate answer.

## Policy and versions

The policy carries a globally unique publisher-controlled policyId, an opaque revision, publisher name, human-readable title, policy URL, role, named vocabulary and ordered rules. Use a publisher-controlled HTTPS identifier in production. Both parties must agree on the authoritative publisher and policy content. Labels and question wording are plain text. The URL provides the human policy and provenance. Evaluators must use the pinned policy content and must not dynamically expand organization groups.

Each rule, organization and relationship type has a unique ID within its respective list. Every rule reference must resolve. Policy authors must spell out group membership (including subsidiaries or philanthropies) as explicit IDs and explain what each relationship type covers in the associated policy. IDs must retain their meaning. The binding to a policy revision includes its human definitions. Archive the versioned human policy alongside the serialized rules. If a clause needs individual judgment, include an author question. A policy may be represented as a whole only when every required clause is represented.

Protocol version is an exact string. Implementations must reject unsupported versions and unknown rule kinds or fields. A change to the meaning of a date, rule, outcome, or wire object requires a new protocol version. Editorial clarifications that leave all valid inputs and outputs unchanged can be issued as documentation errata. The reference package has a separate software version. Behavior-changing fixes must identify affected protocol versions and conformance cases.

A publisher must issue a new immutable policy revision for changes to rules, membership, definitions, question wording, or windows. A receipt refers to the exact protocol, policy and revision used. Replaying it requires the original submission date and authorized input snapshot. A later policy cannot replace those inputs.

## Inputs and meaning of a rule

The evaluation is for one author and one submission. submissionId is an opaque, recipient-scoped identifier for that author's submission. submissionDate is the calendar date of submission, independent of the day the evaluation runs. The authenticated host binds the author, journal, submission, policy revision and date.

- A ties rule selects any listed relationship type AND any listed organization. The organization and type IDs must be mapped into the policy's vocabulary. An unambiguously different identity is outside scope. Unresolved identities must be supplied as null. Open evidence is never a confirmed tie.
- A lookback window includes both endpoints. Subtract the given number of calendar months from submissionDate and clamp the day to the last day of the target month. A tie qualifies if its interval intersects this window.
- A submitted-work rule covers direct support for this particular work by submission, regardless of when it began. The input's supportedSubmittedWork is a submission-specific determination. A historical grant alone cannot answer it.
- An author-question is phrased so that yes reports an interest, no clears that question, and absent or null leaves it unanswered. A question can ask about a personal, professional or perceived interest that the structured ties do not capture. Multiple answers to one question are invalid.
- completeRuleIds records the author's explicit attestation that all relevant ties for each listed tie rule, including its relevant period or work, are represented in this snapshot. unresolvedRuleIds identifies tie rules affected by outstanding evidence or unresolved coverage. Only tie rules may appear in either list. Missing answers, pending records, reduced source scopes and year-only data must survive adaptation. The host must invalidate or reconfirm affected attestations after material changes.

Dates on ties are exact days, calendar years, or null. A year ranges from January 1 through December 31 inclusive. A null endpoint is unknown. Consider all feasible start and end dates consistent with the supplied values and start ≤ end. If all feasible intervals overlap the window, the time criterion is true. If none overlap, it is false. Otherwise it is indeterminate. An impossible interval is an input error. An ongoing tie can use its known active-through date for an evaluation anchored on that date. For other anchors the adapter must retain uncertainty about its end when material.

## Evaluation and disclosure

A confirmed tie matches when all the rule predicates are true. One false predicate rules it out. A remaining unknown makes it a possible match. For each ties rule, completeness requires explicit attestation, no possible matches left unresolved, and no outstanding evidence identified for the rule. A definite match yields true even if coverage is incomplete. With no definite match the rule yields false only when complete, otherwise null. A question is complete once answered yes or no.

Across rules, any true gives true. With all false the result is false. Otherwise it is null. Completeness is tracked independently and requires every rule to be complete. Reportable means at least one interest must be disclosed under this policy. Editorial handling is a separate decision.

An author-facing statement must draw its claims from the same evaluation. It may name confirmed matches. A negative or “no other” declaration requires complete coverage and must identify the policy scope. If incomplete, show that the assessment is incomplete. Specific presentation and language may vary. See the expected English renderings in the examples.

The host must show the recipient and exact release to the author before issuing a receipt. Default flag mode reveals only the result and binding metadata. In matches mode include only rule ID, type ID and organization ID for confirmed matches, or the question rule ID for an affirmative answer. Within a rule, collapse identical returned items. Preserve first input occurrence and policy rule order in the reference serialization. A true result can have further unresolved questions. A receipt omits completeness diagnostics, pending evidence, private identifiers, notes, amounts and unapproved free text. The author may give context to the editor separately.

Each receipt has a fresh receiptId. To correct it, issue a newly approved receipt with supersedes pointing to the previous receipt for the same author, recipient and submission. The original remains identifiable. Hosts must validate ownership, recipient, lineage and the active predecessor before accepting a correction. A receipt is a data format. Delivery, identity, authentication, signatures, retention and withdrawal are host responsibilities.
