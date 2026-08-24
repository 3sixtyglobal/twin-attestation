// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	AttestationConnectorFactory,
	AttestationContexts,
	AttestationSpanAttributes,
	AttestationSpanNames,
	AttestationTypes,
	type IAttestationConnector,
	type IAttestationInformation
} from "@twin.org/attestation-models";
import { ContextIdKeys, ContextIdStore } from "@twin.org/context";
import { ComponentFactory, GeneralError } from "@twin.org/core";
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";
import { SchemaOrgContexts } from "@twin.org/standards-schema-org";
import {
	SpanHelper,
	SpanStatus,
	type ISpan,
	type ISpanOptions,
	type ITracingComponent
} from "@twin.org/tracing-models";
import { AttestationService } from "../src/attestationService.js";

const TEST_ORGANIZATION = "did:test:org";
const TEST_ATTESTATION_ID = "urn:attestation:nft:test-attestation-id";
const TEST_HOLDER = "holder-address-123";
const TEST_ATTESTATION_OBJECT: IJsonLdNodeObject = {
	"@context": "https://schema.org",
	"@type": "Person",
	name: "Alice"
};

function makeMockTracing(): { component: ITracingComponent; ended: ISpan[] } {
	const ended: ISpan[] = [];
	const component: ITracingComponent = {
		className: () => "MockTracing",
		startSpan: async (name: string, options?: ISpanOptions) => SpanHelper.startSpan(name, options),
		endSpan: async (span: ISpan, status?: SpanStatus) => {
			SpanHelper.endSpan(span, status);
			ended.push(span);
		},
		query: async () => ({ entities: [] }),
		getTrace: async () => []
	};
	return { component, ended };
}

class StubAttestationConnector implements IAttestationConnector {
	public getError?: Error;

	public getResult: IAttestationInformation;

	constructor() {
		this.getResult = {
			"@context": [
				SchemaOrgContexts.Context,
				AttestationContexts.Context,
				AttestationContexts.ContextCommon
			],
			type: AttestationTypes.Information,
			id: TEST_ATTESTATION_ID,
			dateCreated: new Date().toISOString(),
			ownerIdentity: TEST_ORGANIZATION,
			attestationObject: TEST_ATTESTATION_OBJECT,
			verified: true
		};
	}

	public className(): string {
		return "StubAttestationConnector";
	}

	public async create(): Promise<string> {
		return TEST_ATTESTATION_ID;
	}

	public async get(): Promise<IAttestationInformation> {
		if (this.getError) {
			throw this.getError;
		}
		return this.getResult;
	}

	public async transfer(): Promise<void> {}

	public async destroy(): Promise<void> {}
}

describe("AttestationService — tracing", () => {
	let stubConnector: StubAttestationConnector;

	beforeEach(() => {
		stubConnector = new StubAttestationConnector();
		AttestationConnectorFactory.register("nft", () => stubConnector);
	});

	async function runInOrgContext<T>(fn: () => Promise<T>): Promise<T> {
		let result: T | undefined;
		await ContextIdStore.run({ [ContextIdKeys.Organization]: TEST_ORGANIZATION }, async () => {
			result = await fn();
		});
		return result as T;
	}

	function makeService(tracingComponentType?: string): AttestationService {
		return new AttestationService({ tracingComponentType });
	}

	describe("instrumented path", () => {
		test("create() records a span", async () => {
			const { component, ended } = makeMockTracing();
			ComponentFactory.register("test-tracing", () => component);

			await runInOrgContext(async () =>
				makeService("test-tracing").create(TEST_ATTESTATION_OBJECT)
			);

			expect(ended).toHaveLength(1);
			expect(ended[0].name).toEqual(AttestationSpanNames.Create);
			expect(ended[0].status).toEqual(SpanStatus.Ok);
		});

		test("get() records a span carrying the id", async () => {
			const { component, ended } = makeMockTracing();
			ComponentFactory.register("test-tracing", () => component);

			await makeService("test-tracing").get(TEST_ATTESTATION_ID);

			expect(ended).toHaveLength(1);
			expect(ended[0].name).toEqual(AttestationSpanNames.Get);
			expect(ended[0].attributes?.[AttestationSpanAttributes.Id]).toEqual(TEST_ATTESTATION_ID);
		});

		test("transfer() records a span carrying the id", async () => {
			const { component, ended } = makeMockTracing();
			ComponentFactory.register("test-tracing", () => component);

			await runInOrgContext(async () =>
				makeService("test-tracing").transfer(TEST_ATTESTATION_ID, TEST_HOLDER)
			);

			expect(ended).toHaveLength(1);
			expect(ended[0].name).toEqual(AttestationSpanNames.Transfer);
			expect(ended[0].attributes?.[AttestationSpanAttributes.Id]).toEqual(TEST_ATTESTATION_ID);
		});

		test("destroy() records a span carrying the id", async () => {
			const { component, ended } = makeMockTracing();
			ComponentFactory.register("test-tracing", () => component);

			await runInOrgContext(async () => makeService("test-tracing").destroy(TEST_ATTESTATION_ID));

			expect(ended).toHaveLength(1);
			expect(ended[0].name).toEqual(AttestationSpanNames.Destroy);
			expect(ended[0].status).toEqual(SpanStatus.Ok);
		});

		test("a failure ends the span with an error and records the domain error", async () => {
			const { component, ended } = makeMockTracing();
			ComponentFactory.register("test-tracing", () => component);
			stubConnector.getError = new GeneralError("test", "connectorFailed");

			await expect(makeService("test-tracing").get(TEST_ATTESTATION_ID)).rejects.toThrow(
				GeneralError
			);

			expect(ended).toHaveLength(1);
			expect(ended[0].status).toEqual(SpanStatus.Error);
			expect(ended[0].attributes?.["exception.message"]).toEqual("attestationService.verifyFailed");
		});
	});

	describe("uninstrumented path", () => {
		test("operations behave unchanged with no tracing component configured", async () => {
			await expect(makeService().get(TEST_ATTESTATION_ID)).resolves.toMatchObject({
				id: TEST_ATTESTATION_ID
			});
		});

		test("an unresolvable tracing component type is ignored", async () => {
			await expect(makeService("not-registered").get(TEST_ATTESTATION_ID)).resolves.toMatchObject({
				id: TEST_ATTESTATION_ID
			});
		});
	});
});
