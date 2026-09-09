// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	AttestationConnectorFactory,
	AttestationContexts,
	AttestationTypes,
	type IAttestationConnector,
	type IAttestationInformation
} from "@twin.org/attestation-models";
import { ContextIdKeys, ContextIdStore } from "@twin.org/context";
import { AlreadyExistsError, ComponentFactory, Is } from "@twin.org/core";
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";
import { SchemaOrgContexts } from "@twin.org/standards-schema-org";
import {
	MetricType,
	type ITelemetryComponent,
	type ITelemetryMetric
} from "@twin.org/telemetry-models";
import { AttestationService } from "../src/attestationService.js";

const TEST_ORGANIZATION = "did:test:org";
const TEST_ATTESTATION_ID = "urn:attestation:nft:test-attestation-id";
const TEST_ATTESTATION_OBJECT: IJsonLdNodeObject = {
	"@context": "https://schema.org",
	"@type": "Person",
	name: "Alice"
};

interface MetricValueEntry {
	id: string;
	value: "inc" | "dec" | number;
	customData?: { [key: string]: unknown };
}

function makeMockTelemetry(): {
	component: ITelemetryComponent;
	created: ITelemetryMetric[];
	values: MetricValueEntry[];
} {
	const created: ITelemetryMetric[] = [];
	const values: MetricValueEntry[] = [];
	const component: ITelemetryComponent = {
		className: () => "MockTelemetry",
		start: async () => {},
		stop: async () => {},
		createMetric: async m => {
			for (const metric of Is.array(m) ? m : [m]) {
				created.push({ ...metric });
			}
		},
		getMetric: async () => ({ metric: {} as never, value: {} as never }),
		updateMetric: async () => {},
		addMetricValue: async (id, value, customData) => {
			values.push({ id, value, customData });
			return "v";
		},
		addMetricValues: async entries => {
			values.push(...entries);
			return entries.map(() => "v");
		},
		getMetricValue: async (id, valueId) => ({
			id: valueId,
			metricId: id,
			value: 0,
			ts: Date.now()
		}),
		removeMetric: async () => {},
		query: async () => ({ entities: [] }),
		queryValues: async () => ({ metric: {} as never, entities: [] })
	};
	return { component, created, values };
}

/**
 * A stub attestation connector whose responses can be overridden per test.
 */
class StubAttestationConnector implements IAttestationConnector {
	public createResult: string;

	public getResult: IAttestationInformation;

	public createError?: Error;

	public getError?: Error;

	public transferError?: Error;

	public destroyError?: Error;

	constructor() {
		this.createResult = TEST_ATTESTATION_ID;
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
		if (this.createError) {
			throw this.createError;
		}
		return this.createResult;
	}

	public async get(): Promise<IAttestationInformation> {
		if (this.getError) {
			throw this.getError;
		}
		return this.getResult;
	}

	public async transfer(): Promise<void> {
		if (this.transferError) {
			throw this.transferError;
		}
	}

	public async destroy(): Promise<void> {
		if (this.destroyError) {
			throw this.destroyError;
		}
	}
}

describe("AttestationService — metrics", () => {
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

	test("start() registers all 5 counters with type Counter", async () => {
		const { component, created } = makeMockTelemetry();
		ComponentFactory.register("test-telemetry", () => component);

		const service = new AttestationService({ telemetryComponentType: "test-telemetry" });
		await service.start();

		expect(created).toHaveLength(5);
		for (const m of created) {
			expect(m.type).toBe(MetricType.Counter);
		}

		const ids = created.map(m => m.id);
		expect(ids).toContain("att_attestations_created");
		expect(ids).toContain("att_attestations_verified");
		expect(ids).toContain("att_attestations_verification_failed");
		expect(ids).toContain("att_attestations_transferred");
		expect(ids).toContain("att_attestations_destroyed");
	});

	test("start() is idempotent — AlreadyExistsError is swallowed", async () => {
		let callCount = 0;
		const component: ITelemetryComponent = {
			...makeMockTelemetry().component,
			createMetric: async () => {
				if (callCount++ > 0) {
					throw new AlreadyExistsError("test", "metric", "id");
				}
			}
		};
		ComponentFactory.register("test-telemetry-idempotent", () => component);

		const service = new AttestationService({ telemetryComponentType: "test-telemetry-idempotent" });
		await service.start();
		await expect(service.start()).resolves.toBeUndefined();
	});

	test("create() emits att_attestations_created with namespace", async () => {
		const { component, values } = makeMockTelemetry();
		ComponentFactory.register("test-telemetry", () => component);

		const service = new AttestationService({ telemetryComponentType: "test-telemetry" });

		await runInOrgContext(async () => service.create(TEST_ATTESTATION_OBJECT));

		const createdValues = values.filter(v => v.id === "att_attestations_created");
		expect(createdValues).toHaveLength(1);
		expect(createdValues[0].value).toBe("inc");
		expect(createdValues[0].customData?.namespace).toBe("nft");
	});

	test("create() with explicit namespace reflects it in customData", async () => {
		const { component, values } = makeMockTelemetry();
		ComponentFactory.register("test-telemetry", () => component);

		const service = new AttestationService({ telemetryComponentType: "test-telemetry" });

		await runInOrgContext(async () => service.create(TEST_ATTESTATION_OBJECT, "nft"));

		const createdValues = values.filter(v => v.id === "att_attestations_created");
		expect(createdValues).toHaveLength(1);
		expect(createdValues[0].customData?.namespace).toBe("nft");
	});

	test("create() failure emits no counter", async () => {
		const { component, values } = makeMockTelemetry();
		ComponentFactory.register("test-telemetry", () => component);
		stubConnector.createError = new Error("boom");

		const service = new AttestationService({ telemetryComponentType: "test-telemetry" });

		await expect(
			runInOrgContext(async () => service.create(TEST_ATTESTATION_OBJECT))
		).rejects.toThrow();

		expect(values.filter(v => v.id === "att_attestations_created")).toHaveLength(0);
	});

	test("get() verified path emits att_attestations_verified", async () => {
		const { component, values } = makeMockTelemetry();
		ComponentFactory.register("test-telemetry", () => component);
		stubConnector.getResult = { ...stubConnector.getResult, verified: true };

		const service = new AttestationService({ telemetryComponentType: "test-telemetry" });

		const result = await service.get(TEST_ATTESTATION_ID);

		expect(result.verified).toBe(true);
		expect(values.filter(v => v.id === "att_attestations_verified")).toHaveLength(1);
		expect(values.filter(v => v.id === "att_attestations_verification_failed")).toHaveLength(0);
	});

	test("get() verification failed path emits att_attestations_verification_failed with failureReason", async () => {
		const { component, values } = makeMockTelemetry();
		ComponentFactory.register("test-telemetry", () => component);
		stubConnector.getResult = {
			...stubConnector.getResult,
			verified: false,
			verificationFailure: "StubAttestationConnector.verificationFailures.revoked"
		};

		const service = new AttestationService({ telemetryComponentType: "test-telemetry" });

		const result = await service.get(TEST_ATTESTATION_ID);

		expect(result.verified).toBe(false);
		const failed = values.filter(v => v.id === "att_attestations_verification_failed");
		expect(failed).toHaveLength(1);
		expect(failed[0].customData?.failureReason).toBe(
			"StubAttestationConnector.verificationFailures.revoked"
		);
		expect(values.filter(v => v.id === "att_attestations_verified")).toHaveLength(0);
	});

	test("get() with verified absent is treated as a failure", async () => {
		const { component, values } = makeMockTelemetry();
		ComponentFactory.register("test-telemetry", () => component);
		delete stubConnector.getResult.verified;

		const service = new AttestationService({ telemetryComponentType: "test-telemetry" });

		await service.get(TEST_ATTESTATION_ID);

		expect(values.filter(v => v.id === "att_attestations_verification_failed")).toHaveLength(1);
		expect(values.filter(v => v.id === "att_attestations_verified")).toHaveLength(0);
	});

	test("get() failure emits no counter", async () => {
		const { component, values } = makeMockTelemetry();
		ComponentFactory.register("test-telemetry", () => component);
		stubConnector.getError = new Error("boom");

		const service = new AttestationService({ telemetryComponentType: "test-telemetry" });

		await expect(service.get(TEST_ATTESTATION_ID)).rejects.toThrow();

		expect(values.filter(v => v.id === "att_attestations_verified")).toHaveLength(0);
		expect(values.filter(v => v.id === "att_attestations_verification_failed")).toHaveLength(0);
	});

	test("transfer() emits att_attestations_transferred", async () => {
		const { component, values } = makeMockTelemetry();
		ComponentFactory.register("test-telemetry", () => component);

		const service = new AttestationService({ telemetryComponentType: "test-telemetry" });

		await runInOrgContext(async () => service.transfer(TEST_ATTESTATION_ID, "holder-address"));

		expect(values.filter(v => v.id === "att_attestations_transferred")).toHaveLength(1);
	});

	test("transfer() failure emits no counter", async () => {
		const { component, values } = makeMockTelemetry();
		ComponentFactory.register("test-telemetry", () => component);
		stubConnector.transferError = new Error("boom");

		const service = new AttestationService({ telemetryComponentType: "test-telemetry" });

		await expect(
			runInOrgContext(async () => service.transfer(TEST_ATTESTATION_ID, "holder-address"))
		).rejects.toThrow();

		expect(values.filter(v => v.id === "att_attestations_transferred")).toHaveLength(0);
	});

	test("destroy() emits att_attestations_destroyed", async () => {
		const { component, values } = makeMockTelemetry();
		ComponentFactory.register("test-telemetry", () => component);

		const service = new AttestationService({ telemetryComponentType: "test-telemetry" });

		await runInOrgContext(async () => service.destroy(TEST_ATTESTATION_ID));

		expect(values.filter(v => v.id === "att_attestations_destroyed")).toHaveLength(1);
	});

	test("destroy() failure emits no counter", async () => {
		const { component, values } = makeMockTelemetry();
		ComponentFactory.register("test-telemetry", () => component);
		stubConnector.destroyError = new Error("boom");

		const service = new AttestationService({ telemetryComponentType: "test-telemetry" });

		await expect(
			runInOrgContext(async () => service.destroy(TEST_ATTESTATION_ID))
		).rejects.toThrow();

		expect(values.filter(v => v.id === "att_attestations_destroyed")).toHaveLength(0);
	});

	test("telemetry component that throws on addMetricValue does not break operations", async () => {
		const component: ITelemetryComponent = {
			...makeMockTelemetry().component,
			addMetricValue: async () => {
				throw new Error("telemetry outage");
			}
		};
		ComponentFactory.register("test-telemetry-broken", () => component);

		const service = new AttestationService({ telemetryComponentType: "test-telemetry-broken" });

		const created = await runInOrgContext(async () => service.create(TEST_ATTESTATION_OBJECT));
		expect(created).toBe(TEST_ATTESTATION_ID);

		const verified = await service.get(TEST_ATTESTATION_ID);
		expect(verified.verified).toBe(true);

		await runInOrgContext(async () => service.transfer(TEST_ATTESTATION_ID, "holder-address"));
		await runInOrgContext(async () => service.destroy(TEST_ATTESTATION_ID));
	});

	test("service works without telemetryComponentType — no errors, all operations succeed", async () => {
		const service = new AttestationService();

		const created = await runInOrgContext(async () => service.create(TEST_ATTESTATION_OBJECT));
		expect(created).toBe(TEST_ATTESTATION_ID);

		const verified = await service.get(TEST_ATTESTATION_ID);
		expect(verified.verified).toBe(true);

		await runInOrgContext(async () => service.transfer(TEST_ATTESTATION_ID, "holder-address"));
		await runInOrgContext(async () => service.destroy(TEST_ATTESTATION_ID));
	});
});
