const assert = require("node:assert/strict");
const test = require("node:test");
const { evaluate, receipt, statement } = require("../dist/src/index.js");
const examples = {
	ror: require("../examples/ror.json"),
	sectors: require("../examples/sectors.json"),
	industry: require("../examples/industry.json"),
	period: require("../examples/period.json"),
	work: require("../examples/work.json"),
};
for (const [name, ex] of Object.entries(examples)) {
	test(name + " journal receipt and statement", () => {
		const evaluation = evaluate(ex.policy, ex.input);
		assert.deepEqual(
			receipt(evaluation, "example-receipt", "matches"),
			ex.receipt,
		);
		assert.equal(statement(ex.policy, evaluation), ex.statement);
		const { matches, ...rest } = ex.receipt;
		assert.deepEqual(receipt(evaluation, "example-receipt"), {
			...rest,
			mode: "flag",
		});
	});
}
for (const c of require("./cases.json")) {
	test(c.name, () => {
		const ex = examples[c.example];
		const evaluation = evaluate(ex.policy, { ...ex.input, ...c.input });
		assert.equal(evaluation.reportable, c.expected.reportable);
		assert.equal(evaluation.complete, c.expected.complete);
		assert.equal(
			receipt(evaluation, "r1", "matches").reportable,
			c.expected.reportable,
		);
	});
}
const { policy, input } = examples.period;
const invalid = [
	["unsupported protocol", { ...policy, protocolVersion: "1.0" }, input],
	[
		"unknown rule kind",
		{ ...policy, rules: [{ ...policy.rules[0], kind: "custom" }] },
		input,
	],
	[
		"duplicate policy rule",
		{ ...policy, rules: [...policy.rules, ...policy.rules] },
		input,
	],
	[
		"undefined policy term",
		{ ...policy, organizations: [{ id: "other", label: "Other" }] },
		input,
	],
	["unbound revision", policy, { ...input, revision: "9" }],
	["invalid date", policy, { ...input, submissionDate: "2026-02-30" }],
	[
		"inverted tie dates",
		policy,
		{ ...input, ties: [{ ...input.ties[0], start: "2025", end: "2024" }] },
	],
	["unknown certainty scope", policy, { ...input, completeRuleIds: ["other"] }],
	["unexpected private fields", policy, { ...input, notes: "private" }],
];
const sectors = examples.sectors;
const review = sectors.input.organizationTypeAnswers[0];
const unlisted = sectors.input.additionalOrganizations[0];
invalid.push(
	[
		"misspelled organization",
		policy,
		{ ...input, ties: [{ ...input.ties[0], organizationId: "example:lrak" }] },
	],
	[
		"misspelled relationship",
		policy,
		{ ...input, ties: [{ ...input.ties[0], relationshipType: "fundign" }] },
	],
	[
		"future direct support",
		examples.work.policy,
		{
			...examples.work.input,
			ties: [{ ...examples.work.input.ties[0], start: "2028", end: "2029" }],
		},
	],
	[
		"previous draft requires its pinned evaluator",
		policy,
		{ ...input, protocolVersion: "0.1" },
	],
	[
		"undeclared organization type selector",
		{ ...sectors.policy, organizationTypes: [] },
		sectors.input,
	],
	[
		"undeclared type answer",
		sectors.policy,
		{
			...sectors.input,
			organizationTypeAnswers: [{ ...review, typeId: "charty" }],
		},
	],
	[
		"type answer for unknown organization",
		sectors.policy,
		{
			...sectors.input,
			organizationTypeAnswers: [
				{ ...review, organizationId: "example:unknown" },
			],
		},
	],
	[
		"conflicting classification",
		sectors.policy,
		{
			...sectors.input,
			organizationTypeAnswers: [review, { ...review, member: false }],
		},
	],
	[
		"unconfirmed distinct identity",
		sectors.policy,
		{
			...sectors.input,
			additionalOrganizations: [{ ...unlisted, distinctFromListed: false }],
		},
	],
	[
		"ambiguous duplicate organization",
		{
			...sectors.policy,
			organizations: [{ id: unlisted.id, label: unlisted.label }],
		},
		sectors.input,
	],
);
test("named or typed selectors share a rule; named match takes precedence", () => {
	const rule = {
		...sectors.policy.rules[0],
		organizationIds: ["example:lark"],
	};
	const p = {
		...sectors.policy,
		organizations: examples.industry.policy.organizations,
		rules: [rule],
	};
	const i = {
		...sectors.input,
		ties: [...sectors.input.ties, examples.industry.input.ties[0]],
		organizationTypeAnswers: [
			...sectors.input.organizationTypeAnswers,
			{ ...review, organizationId: "example:lark" },
		],
	};
	const value = receipt(evaluate(p, i), "r1", "matches");
	assert.deepEqual(value.matches, [
		...sectors.receipt.matches,
		{
			kind: "tie",
			ruleId: "funding",
			relationshipType: "research_funding",
			organizationId: "example:lark",
		},
	]);
});
test("a direct-question policy needs no organization vocabulary", () => {
	const p = {
		...examples.work.policy,
		relationshipTypes: [],
		organizations: [],
		rules: [examples.work.policy.rules[1]],
	};
	const i = {
		...examples.work.input,
		ties: [],
		completeRuleIds: [],
		answers: [{ ruleId: "other", answer: false }],
	};
	assert.equal(evaluate(p, i).reportable, false);
});
for (const [name, p, i] of invalid)
	test(name, () => assert.throws(() => evaluate(p, i)));
test("multiple ties with the same returned fields disclose one item per rule", () => {
	const e = evaluate(policy, {
		...input,
		ties: [...input.ties, ...input.ties],
	});
	assert.equal(receipt(e, "r", "matches").matches.length, 1);
});
test("a correction links to its predecessor without changing it", () => {
	const initial = receipt(evaluate(policy, input), "r1");
	const correction = receipt(
		evaluate(policy, { ...input, ties: [] }),
		"r2",
		"flag",
		"r1",
	);
	assert.equal(correction.supersedes, initial.receiptId);
	assert.equal(correction.reportable, false);
	assert.equal(initial.reportable, true);
	assert.throws(() => receipt(evaluate(policy, input), "r1", "flag", "r1"));
});

test("a pinned crosswalk resolves aliases without changing the disclosed ID", () => {
	const alias = "https://example.org/registry/123";
	const [first, ...rest] = policy.organizations;
	const p = {
		...policy,
		organizations: [{ ...first, externalIds: [alias] }, ...rest],
	};
	const i = { ...input, ties: [{ ...input.ties[0], organizationId: alias }] };
	assert.deepEqual(evaluate(p, i), evaluate(policy, input));
	assert.throws(() =>
		evaluate(
			{
				...p,
				organizations: [
					...p.organizations,
					{ id: "other", label: "Other", externalIds: [alias] },
				],
			},
			i,
		),
	);
	assert.throws(() =>
		evaluate(p, {
			...i,
			additionalOrganizations: [
				{ id: alias, label: "Duplicate", distinctFromListed: true },
			],
		}),
	);
});

test("private ROR references resolve to the pinned full URL", () => {
	const { policy, input, receipt: expected } = examples.ror;
	for (const id of [
		"00jmfr291",
		"ROR:00JMFR291",
		"ror.org/00jmfr291",
		"http://ror.org/00jmfr291/",
	]) {
		const ties = [{ ...input.ties[0], organizationId: id }];
		assert.deepEqual(
			receipt(
				evaluate(policy, { ...input, ties }),
				expected.receiptId,
				"matches",
			),
			expected,
		);
	}
});
test("ROR typos, unpinned RORs and ambiguous declarations cannot clear the rule", () => {
	const { policy, input } = examples.ror;
	const [org] = policy.organizations;
	for (const id of [
		"https://ror.org/00jmfr290",
		"https://ror.org/00jmfu291",
		"https://ror.org/02mhbdp94",
	]) {
		assert.throws(() =>
			evaluate(policy, {
				...input,
				ties: [{ ...input.ties[0], organizationId: id }],
			}),
		);
	}
	for (const id of ["00jmfr291", "https://ror.org/00jmfr290"]) {
		assert.throws(() =>
			evaluate(policy, {
				...input,
				additionalOrganizations: [
					{ id, label: "Other", distinctFromListed: true },
				],
			}),
		);
	}
	assert.throws(
		() =>
			evaluate(
				{
					...policy,
					organizations: [
						{ ...org, id: org.externalIds[0], externalIds: [org.id] },
					],
				},
				input,
			),
		/verified ROR/,
	);
});
