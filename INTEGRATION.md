# Integration handoff

The first integration is a private author workflow. Keep the evaluator portable. The application owns sessions, storage, evidence review, and the final approval screen.

1. Load an explicitly trusted, immutable journal policy revision. Show its definitions and source to the author. Keep the reviewed policy content with the submission.
2. Map authenticated, user-scoped records to the input schema. Resolve confirmed organizations and relationship types to the policy vocabulary. Use null for ambiguity. Use exact days only where the source supports them. Map unresolved suggestions to affected rules without sharing them. Existing profile review timestamps and accuracy-only certificates cannot populate completeRuleIds.
3. Ask for any missing work-specific relevance, question answers, and completeness attestations. Bind them to the exact rule scope, dates, author and input snapshot. An author can say they are unsure. Show unresolved items privately.
4. Call evaluate(policy, input), then statement(policy, evaluation). Keep the full evaluation private. Preview the flag or match-only receipt, exact policy and recipient. An editor who receives true may need to contact the author for context.
5. On explicit approval, recheck the snapshot and policy revision, generate an opaque receipt ID and save the authorized receipt. Deliver over an authenticated channel. For any signature requirement, implement and record the journal's agreed sign-off mechanism. JSON on its own does not establish who signed it.
6. Implement corrections as new receipt versions. Bind each predecessor to the same author and recipient. Handle repeat delivery idempotently. Keep changes to public search and profile publication independent of this workflow.

For another implementation, run each object in conformance/cases.json against its named example. Shallowly replace the listed top-level input fields, preserving all others. Assert both the nullable reportable value and complete. Then compare each complete worked example's reference receipt and English reference rendering. Other languages can localize prose while preserving its claims. The reference test runner also exercises malformed input and disclosure boundaries.

## Prior work informing the scope

COPE asks journals to define and manage interests across roles and to address them before and after publication. Its submitted-manuscript flowchart gives authors an opportunity to explain or amend a declaration. Here the publisher owns the definition, the author reviews the declaration, corrections are linked, and the journal determines the editorial response. Reviewer eligibility needs person-to-person and institutional relationships and is outside draft 0.1. [COPE editorial toolkit](https://members.publicationethics.org/sites/default/files/cope-ethics-toolkit-journal-editors-publishers.pdf), [submitted-manuscript flowchart](https://doi.org/10.24318/cope.2019.2.6), [peer reviewer guidance](https://doi.org/10.24318/cope.2019.1.9).

ICMJE's explanation distinguishes support for the work from other interests during the 36 months preceding submission. The examples exercise those two time semantics. [ICMJE disclosure guidance](https://icmje.org/news-and-editorials/new_rec_aug2013.html).

AAMC Convey demonstrates recipient-specific disclosures and additional questions. MedBiquitous publishes Financial Interest schemas for exchanging underlying facts. They are relevant when designing adapters. [Convey FAQ](https://www.convey.org/faq), [MedBiquitous schema registry](https://ns.medbiq.org/).

A pilot should test a real journal's full wording and one contested example with an editor. Confirm the interpretation of false, the permitted disclosure details and how the journal handles incomplete cases. Claims of conformity to a named journal or professional body's policy need a reviewed mapping of its full requirements.
