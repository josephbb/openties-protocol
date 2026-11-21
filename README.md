# OpenTies Disclosure Policy Protocol

Draft 0.1, for individual author disclosures at manuscript submission.

A publisher defines what an author must report. An implementation applies those rules to confirmed relationships and submission-specific answers, shows the author a statement, and can issue an approved receipt to the journal. A journal can request a flag alone or the matching items. The author's private record stays with the evaluating system.

Start with the [two worked examples](examples/). Each file contains a policy, private input, expected receipt, and statement. The period example covers funding and consulting in a 36-month window. The submitted-work example includes older support and a question requiring the author's judgment.

- [Normative specification and versioning](SPEC.md)
- [JSON Schemas](schemas/) (Draft 2020-12, with date and URI format validation)
- [Language-independent conformance cases](conformance/cases.json)
- [Integration guide and prior work](INTEGRATION.md)
- [TypeScript reference implementation](src/index.ts)

Run the suite on Node 22+ with pnpm.

    pnpm install --frozen-lockfile
    pnpm test

The package builds with its own lockfile. The examples contain fictional journals and organizations. Draft 0.1 is available for local integration and evaluation.
