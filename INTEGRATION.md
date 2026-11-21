# Integration handoff

The first integration is a private author workflow. Keep the evaluator portable. The application owns sessions, storage, evidence review, and the final approval screen.

1. Load an explicitly trusted, immutable journal policy revision. Show its definitions and source to the author. Keep the reviewed policy content with the submission.
2. Map authenticated, user-scoped records to the input schema. Resolve confirmed organizations and relationship types to the policy vocabulary. Use null for ambiguity. Use exact days only where the source supports them. Map unresolved suggestions to affected rules without sharing them. Existing profile review timestamps and accuracy-only certificates cannot populate completeRuleIds.
3. Ask for any missing work-specific relevance, question answers, and completeness attestations. Bind them to the exact rule scope, dates, author and input snapshot. An author can say they are unsure. Show unresolved items privately.
4. Call evaluate(policy, input), then statement(policy, evaluation). Keep the full evaluation private. Allocate an opaque receipt ID and preview the exact receipt, policy questions and recipient. An editor who receives true may need to contact the author for context.
5. On explicit approval, recheck the snapshot and policy revision, save and deliver the approved object. If the content or recipient changes, request approval again. Use an authenticated channel. For any signature requirement, implement and record the journal's agreed sign-off mechanism. JSON on its own does not establish who signed it.
6. Implement corrections as new receipt versions. Bind each predecessor to the same author and recipient. Handle repeat delivery idempotently. Keep changes to public search and profile publication independent of this workflow.

## Mapping organizations

Start with the entity the researcher actually dealt with. When you verify its Research Organization Registry (ROR) record, use the full lowercase HTTPS ROR URL as the organization ID. This applies to named policy entities and additional organizations reviewed for a type-based rule. OpenAlex institution IDs are useful when starting from an authorship affiliation. Use the linked ROR record to check the identity, including aliases, location and parent or child relationships. An affiliation suggests a possible organization. The author still confirms the tie. [ROR record fields](https://ror.readme.io/docs/ror-data-structure) · [OpenAlex institutions](https://help.openalex.org/data/institutions/)

For example, the University of Michigan’s OpenAlex record links `https://openalex.org/I27837315` to `https://ror.org/00jmfr291`. A policy can pin that pair once. A repository can then submit the OpenAlex ID, and a matches receipt carries the ROR URL. The example uses a fictional disclosure. [OpenAlex institution record](https://api.openalex.org/institutions/I27837315) · [Worked example](examples/ror.json)

For a named organization, put the canonical ID in the policy and any verified equivalent identifiers in its `externalIds`. For an organization outside ROR’s coverage, use a stable, namespaced public company or charity registry ID, or a maintained organization identifier whose meaning the recipient can resolve. Keep the registry, record, release or retrieval date, and the mapping decision with the private snapshot. Never send an internal user, tie or evidence ID as an organization ID. A name search that returns no results leaves the identity unresolved. Treat parents, subsidiaries, company foundations and successor entities separately unless the pinned policy covers them.

Classify under the journal’s words. For a rule covering registered charities, a charity register entry in the relevant jurisdiction can support a yes. A broad ROR nonprofit classification alone leaves the question open. An organization may be both a funder and a charity. Record a no only after checking the evidence against that particular definition. If status changed, establish which status the policy asks about and at what date. When one membership answer cannot represent the history for a submission, leave the affected rule unresolved and ask for clarification. Do not apply a single current classification across incompatible periods. Freeze the evidence and review decisions before evaluation.

## Receiving a receipt

1. Validate the receipt schema and exact protocol version, then check the authenticated exchange for the expected recipient, author-specific submission reference, date, policy ID and revision. If two copies of a supposedly immutable revision disagree, stop and resolve which policy was approved.
2. Check each match against its rule in that policy. An affirmative answer must refer to a question. For a tie, verify the relationship type and either the named organization or the declared organization type selected by that rule. In a type-based match, the ID may identify an organization absent from the journal’s list. The receipt conveys the approved classification claim. It carries no underlying classification evidence. Reject duplicates or a match claiming a type outside the rule.
3. Record identical repeat deliveries once. Flag conflicting reuse of an ID. Accept a correction only against the active predecessor for the same author, recipient and submission.
4. Track delivery separately from the answer. No receipt means no approved response has arrived. An approved null is a valid indeterminate response. An invalid receipt needs correction before the journal can use it.

## Testing another implementation

For another implementation, run each object in conformance/cases.json against its named example. Shallowly replace the listed top-level input fields, preserving all others. Assert both the nullable reportable value and complete. Then compare each complete worked example's reference receipt and English reference rendering. Other languages can localize prose while preserving its claims. The reference test runner also exercises malformed input and disclosure boundaries.

## Prior work informing the scope

COPE asks journals to define and manage interests across roles and to address them before and after publication. Its submitted-manuscript flowchart gives authors an opportunity to explain or amend a declaration. Here the publisher owns the definition, the author reviews the declaration, corrections are linked, and the journal determines the editorial response. Reviewer eligibility needs person-to-person and institutional relationships and is outside draft 0.2. [COPE editorial toolkit](https://members.publicationethics.org/sites/default/files/cope-ethics-toolkit-journal-editors-publishers.pdf), [submitted-manuscript flowchart](https://doi.org/10.24318/cope.2019.2.6), [peer reviewer guidance](https://doi.org/10.24318/cope.2019.1.9).

ICMJE's explanation distinguishes support for the work from other interests during the 36 months preceding submission. The examples exercise those two time semantics. [ICMJE disclosure guidance](https://icmje.org/news-and-editorials/new_rec_aug2013.html).

AAMC Convey demonstrates recipient-specific disclosures and additional questions. MedBiquitous publishes Financial Interest schemas for exchanging underlying facts. They are relevant when designing adapters. [Convey FAQ](https://www.convey.org/faq), [MedBiquitous schema registry](https://ns.medbiq.org/).

A pilot should test a real journal's full wording and one contested example with an editor. Confirm the interpretation of false, the permitted disclosure details and how the journal handles incomplete cases. Claims of conformity to a named journal or professional body's policy need a reviewed mapping of its full requirements.
