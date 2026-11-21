import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import policySchema from "../schemas/policy.json";
import inputSchema from "../schemas/input.json";
import resultSchema from "../schemas/result.json";

type Flag = boolean | null;
type Term = { id: string; label: string };
type Window = { kind: "lookback"; months: number } | { kind: "submitted-work" };
type TieRule = Term & {
	kind: "ties";
	relationshipTypes: string[];
	organizationIds?: string[];
	organizationTypeIds?: string[];
	window: Window;
};
type Question = Term & { kind: "author-question" };
type Reference = { protocolVersion: "0.2"; policyId: string; revision: string };
export type Policy = Reference & {
	publisher: string;
	title: string;
	policyUrl: string;
	role: "author";
	relationshipTypes: Term[];
	organizations: (Term & { externalIds?: string[] })[];
	organizationTypes?: (Term & { definition: string })[];
	rules: (TieRule | Question)[];
};
type Tie = {
	relationshipType: string | null;
	organizationId: string | null;
	start: string | null;
	end: string | null;
	supportedSubmittedWork: Flag;
};
export type Input = Reference & {
	submissionId: string;
	submissionDate: string;
	ties: Tie[];
	additionalOrganizations?: (Term & { distinctFromListed: true })[];
	organizationTypeAnswers?: {
		organizationId: string;
		typeId: string;
		member: boolean;
	}[];
	completeRuleIds: string[];
	unresolvedRuleIds: string[];
	answers: { ruleId: string; answer: Flag }[];
};
type Match =
	| {
			ruleId: string;
			kind: "tie";
			relationshipType: string;
			organizationId: string;
			organizationTypeId?: string;
	  }
	| { ruleId: string; kind: "answer" };
type Receipt = Pick<
	Input,
	| "protocolVersion"
	| "policyId"
	| "revision"
	| "submissionId"
	| "submissionDate"
> & {
	receiptId: string;
	supersedes?: string;
	mode: "flag" | "matches";
	reportable: Flag;
	matches?: Match[];
};

const validator = new Ajv2020({ strictRequired: false });
addFormats(validator);
const validPolicy = validator.compile<Policy>(policySchema);
const validInput = validator.compile<Input>(inputSchema);
const validResult = validator.compile<Receipt>(resultSchema);

function unique(values: string[]) {
	if (new Set(values).size !== values.length)
		throw new Error("Duplicate identifier");
}
function subset(values: string[], allowed: Set<string>) {
	if (values.some((id) => !allowed.has(id)))
		throw new Error("Unknown reference");
}
function ids(terms: Term[]) {
	const values = terms.map((term) => term.id);
	unique(values);
	return new Set(values);
}

// Integer YYYYMMDD keeps dates comparable without time zones.
function day(value: string) {
	return Number(value.replaceAll("-", ""));
}
function bounds(value: string | null): [number, number] {
	if (value === null) return [-Infinity, Infinity];
	if (value.length === 4)
		return [Number(value) * 10000 + 101, Number(value) * 10000 + 1231];
	return [day(value), day(value)];
}
function lookback(date: string, months: number) {
	const [year, month, d] = date.split("-").map(Number);
	const serial = year * 12 + month - 1 - months;
	const y = Math.floor(serial / 12);
	const m = serial - y * 12 + 1;
	const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
	const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	return y * 10000 + m * 100 + Math.min(d, days[m - 1]);
}
function timeMatch(tie: Tie, rule: TieRule, date: string): Flag {
	if (rule.window.kind === "submitted-work") {
		if (bounds(tie.start)[0] > day(date)) return false;
		return tie.supportedSubmittedWork;
	}
	const from = lookback(date, rule.window.months);
	const through = day(date);
	const [startMin, startMax] = bounds(tie.start);
	const [endMin, endMax] = bounds(tie.end);
	if (endMax < from || startMin > through) return false;
	if (
		Math.min(startMax, endMax) <= through &&
		Math.max(endMin, startMin) >= from
	)
		return true;
	return null;
}
function aggregate(values: Flag[]): Flag {
	if (values.includes(true)) return true;
	return values.includes(null) ? null : false;
}

// A named match takes precedence. For a type match return the first confirmed
// type in rule order, so the receipt can identify the basis for the match.
function organizationMatch(
	rule: TieRule,
	id: string | null,
	answers: Map<string, Map<string, boolean>>,
): Flag | string {
	if (id === null) return null;
	if (rule.organizationIds?.includes(id)) return true;
	let unresolved = false;
	for (const type of rule.organizationTypeIds ?? []) {
		const member = answers.get(id)?.get(type);
		if (member === true) return type;
		if (member === undefined) unresolved = true;
	}
	return unresolved ? null : false;
}

// Registry verification is done by the adapter. Here we verify spelling and
// checksum offline so every evaluator can replay the same pinned mapping.
function rorUrl(id: string): string | null {
	const prefix = /^(?:(?:https?:\/\/)?(?:www\.)?ror\.org(?:\/|$)|ror:)/i;
	if (!prefix.test(id) && !/^0[a-z0-9]{6}[0-9]{2}$/i.test(id)) return null;
	const token = id.replace(prefix, "").replace(/\/$/, "").toLowerCase();
	if (!/^0[0-9a-hjkmnp-tv-z]{6}[0-9]{2}$/.test(token))
		throw new Error("Invalid ROR identifier");
	const alphabet = "0123456789abcdefghjkmnpqrstvwxyz";
	let number = 0;
	for (const digit of token.slice(1, 7))
		number = number * 32 + alphabet.indexOf(digit);
	if (Number(token.slice(-2)) !== 98 - ((number * 100) % 97))
		throw new Error("Invalid ROR checksum");
	return "https://ror.org/" + token;
}

// All input and output boundaries validate independently of the host application.
export function evaluate(rawPolicy: unknown, rawInput: unknown) {
	if (!validPolicy(rawPolicy))
		throw new Error(
			"Invalid policy: " + validator.errorsText(validPolicy.errors),
		);
	if (!validInput(rawInput))
		throw new Error(
			"Invalid input: " + validator.errorsText(validInput.errors),
		);
	const policy = rawPolicy,
		input = rawInput;
	if (input.policyId !== policy.policyId || input.revision !== policy.revision)
		throw new Error("Policy revision mismatch");
	const types = ids(policy.relationshipTypes),
		orgs = ids(policy.organizations);
	const additional = input.additionalOrganizations ?? [];
	const knownOrgs = ids([...policy.organizations, ...additional]);
	for (const id of knownOrgs) {
		const ror = rorUrl(id);
		if (ror && ror !== id) throw new Error("Use the full canonical ROR URL");
	}
	const canonical = new Map([...knownOrgs].map((id) => [id, id]));
	for (const org of policy.organizations) {
		for (const alias of org.externalIds ?? []) {
			if (rorUrl(alias))
				throw new Error("Use the verified ROR URL as the organization ID");
			if (canonical.has(alias))
				throw new Error("Ambiguous organization identifier");
			canonical.set(alias, org.id);
		}
	}
	function resolveOrganization(id: string) {
		const resolved = canonical.get(rorUrl(id) ?? id);
		if (!resolved) throw new Error("Unknown organization reference");
		return resolved;
	}
	const orgTypes = ids(policy.organizationTypes ?? []);
	const membership = new Map<string, Map<string, boolean>>();
	for (const {
		organizationId,
		typeId,
		member,
	} of input.organizationTypeAnswers ?? []) {
		const id = resolveOrganization(organizationId);
		subset([typeId], orgTypes);
		const answers = membership.get(id) ?? new Map<string, boolean>();
		if (answers.has(typeId))
			throw new Error("Duplicate organization type answer");
		answers.set(typeId, member);
		membership.set(id, answers);
	}
	ids(policy.rules);
	const tieRules = new Set(
		policy.rules.filter((r) => r.kind === "ties").map((r) => r.id),
	);
	const questions = new Set(
		policy.rules.filter((r) => r.kind === "author-question").map((r) => r.id),
	);
	const answers = input.answers.map((a) => a.ruleId);
	unique(answers);
	subset(answers, questions);
	subset(input.completeRuleIds, tieRules);
	subset(input.unresolvedRuleIds, tieRules);
	const ties = input.ties.map((tie) => {
		if (tie.relationshipType !== null) subset([tie.relationshipType], types);
		if (
			tie.supportedSubmittedWork === true &&
			bounds(tie.start)[0] > day(input.submissionDate)
		)
			throw new Error("Support starts after submission");
		if (bounds(tie.start)[0] > bounds(tie.end)[1])
			throw new Error("Inconsistent tie dates");
		return {
			...tie,
			organizationId:
				tie.organizationId === null
					? null
					: resolveOrganization(tie.organizationId),
		};
	});
	const results = policy.rules.map((rule) => {
		const matches: Match[] = [];
		if (rule.kind === "author-question") {
			const answer =
				input.answers.find((a) => a.ruleId === rule.id)?.answer ?? null;
			if (answer) matches.push({ ruleId: rule.id, kind: "answer" });
			return {
				ruleId: rule.id,
				reportable: answer,
				complete: answer !== null,
				matches,
			};
		}
		subset(rule.relationshipTypes, types);
		subset(rule.organizationIds ?? [], orgs);
		subset(rule.organizationTypeIds ?? [], orgTypes);
		let uncertain = input.unresolvedRuleIds.includes(rule.id);
		for (const tie of ties) {
			const organization = organizationMatch(
				rule,
				tie.organizationId,
				membership,
			);
			if (organization === false) continue;
			if (
				tie.relationshipType !== null &&
				!rule.relationshipTypes.includes(tie.relationshipType)
			)
				continue;
			const when = timeMatch(tie, rule, input.submissionDate);
			if (when === false) continue;
			if (
				when === null ||
				organization === null ||
				tie.organizationId === null ||
				tie.relationshipType === null
			) {
				uncertain = true;
			} else if (
				!matches.some(
					(m) =>
						m.kind === "tie" &&
						m.relationshipType === tie.relationshipType &&
						m.organizationId === tie.organizationId,
				)
			) {
				matches.push({
					ruleId: rule.id,
					kind: "tie",
					relationshipType: tie.relationshipType,
					organizationId: tie.organizationId,
					...(typeof organization === "string"
						? { organizationTypeId: organization }
						: {}),
				});
			}
		}
		const complete = input.completeRuleIds.includes(rule.id) && !uncertain;
		return {
			ruleId: rule.id,
			reportable: matches.length ? true : complete ? false : null,
			complete,
			matches,
		};
	});
	const reference = {
		protocolVersion: input.protocolVersion,
		policyId: input.policyId,
		revision: input.revision,
		submissionId: input.submissionId,
		submissionDate: input.submissionDate,
	};
	return {
		reference,
		additionalOrganizations: additional.map(({ id, label }) => ({ id, label })),
		results,
		reportable: aggregate(results.map((r) => r.reportable)),
		complete: results.every((r) => r.complete),
	};
}
type Evaluation = ReturnType<typeof evaluate>;

// Use only after the author has approved this projection for this recipient.
export function receipt(
	evaluation: Evaluation,
	receiptId: string,
	mode: "flag" | "matches" = "flag",
	supersedes?: string,
): Receipt {
	const value: Receipt = {
		...evaluation.reference,
		receiptId,
		mode,
		reportable: evaluation.reportable,
	};
	if (supersedes !== undefined) value.supersedes = supersedes;
	if (mode === "matches")
		value.matches = evaluation.results.flatMap((r) => r.matches);
	if (!validResult(value) || receiptId === supersedes)
		throw new Error("Invalid receipt");
	return value;
}

export function statement(policy: Policy, evaluation: Evaluation): string {
	if (
		policy.policyId !== evaluation.reference.policyId ||
		policy.revision !== evaluation.reference.revision
	)
		throw new Error("Policy revision mismatch");
	const lines: string[] = [];
	for (const result of evaluation.results) {
		for (const match of result.matches) {
			if (match.kind === "answer") {
				lines.push(
					"The author answered yes to “" +
						policy.rules.find((r) => r.id === match.ruleId)!.label +
						"”.",
				);
			} else {
				const type = policy.relationshipTypes.find(
					(t) => t.id === match.relationshipType,
				)!;
				const org = [
					...policy.organizations,
					...evaluation.additionalOrganizations,
				].find((o) => o.id === match.organizationId)!;
				const text =
					"The author reports " + type.label + " (" + org.label + ").";
				if (!lines.includes(text)) lines.push(text);
			}
		}
	}
	const scope =
		policy.title + " (revision " + policy.revision + ") for this submission";
	if (evaluation.complete) {
		lines.push(
			"The author declares no " +
				(evaluation.reportable ? "other " : "") +
				"interests reportable under " +
				scope +
				".",
		);
	} else {
		lines.push("Assessment under " + scope + " is incomplete.");
	}
	return lines.join(" ");
}
