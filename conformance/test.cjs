const assert = require("node:assert/strict");
const test = require("node:test");
const { evaluate, receipt, statement } = require("../dist/src/index.js");
const examples = {
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
