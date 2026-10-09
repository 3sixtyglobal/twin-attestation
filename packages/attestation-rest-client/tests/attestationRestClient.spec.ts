// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAttestationInformation } from "@3sixty/attestation-models";
import { AttestationContexts, AttestationTypes } from "@3sixty/attestation-models";
import { GuardError } from "@3sixty/core";
import type { IJsonLdNodeObject } from "@3sixty/data-json-ld";
import { SchemaOrgContexts } from "@3sixty/standards-schema-org";
import { HttpMethod } from "@3sixty/web";
import { AttestationRestClient } from "../src/attestationRestClient.js";
import {
	createdResponse,
	jsonResponse,
	noContentResponse,
	setupFetchMock,
	teardownFetchMock
} from "./helpers/restClientTestHelpers.js";

// OpenAPI spec: ../../attestation-service/docs/open-api/spec.json
const ENDPOINT = "http://localhost:8080";
const PREFIX = "attestation";

const ATTESTATION_URN = "urn:attestation:test001";
const HOLDER_ADDRESS = "iota1qp8h9gf9rme7kv7l3n2z0x4y5w6u7t8s9r0q";
const LOCATION = `${ENDPOINT}/${PREFIX}/${ATTESTATION_URN}`;

const TEST_ATTESTATION_OBJECT: IJsonLdNodeObject = {
	"@type": "https://schema.org/Thing",
	name: "Test attestation data"
};

const TEST_ATTESTATION_INFORMATION: IAttestationInformation = {
	"@context": [
		SchemaOrgContexts.Context,
		AttestationContexts.Context,
		AttestationContexts.ContextCommon
	],
	type: AttestationTypes.Information,
	id: ATTESTATION_URN,
	dateCreated: "2024-01-01T00:00:00Z",
	ownerIdentity: "did:iota:test:owner001",
	attestationObject: TEST_ATTESTATION_OBJECT
};

const fetchMock = vi.fn();

describe("AttestationRestClient", () => {
	let client: AttestationRestClient;

	beforeEach(() => {
		setupFetchMock(fetchMock);
		client = new AttestationRestClient({ endpoint: ENDPOINT });
	});

	afterEach(() => {
		teardownFetchMock(fetchMock);
	});

	describe("create", () => {
		test("throws a guard error when attestationObject is undefined", async () => {
			await expect(client.create(undefined as unknown as IJsonLdNodeObject)).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.objectUndefined"
			});
		});

		test("sends POST to /{prefix}", async () => {
			fetchMock.mockResolvedValueOnce(createdResponse(LOCATION));

			await client.create(TEST_ATTESTATION_OBJECT);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(`${ENDPOINT}/${PREFIX}`);
			expect(options.method).toBe(HttpMethod.POST);
		});

		test("sends the attestation object as the request body", async () => {
			fetchMock.mockResolvedValueOnce(createdResponse(LOCATION));

			await client.create(TEST_ATTESTATION_OBJECT);

			const [, options] = fetchMock.mock.calls[0];
			const body = JSON.parse(options.body);
			expect(body.attestationObject).toEqual(TEST_ATTESTATION_OBJECT);
		});

		test("sends namespace when provided", async () => {
			fetchMock.mockResolvedValueOnce(createdResponse(LOCATION));

			await client.create(TEST_ATTESTATION_OBJECT, "custom-namespace");

			const [, options] = fetchMock.mock.calls[0];
			const body = JSON.parse(options.body);
			expect(body.namespace).toBe("custom-namespace");
		});

		test("returns the attestation id extracted from the location header", async () => {
			fetchMock.mockResolvedValueOnce(createdResponse(LOCATION));

			const result = await client.create(TEST_ATTESTATION_OBJECT);

			expect(result).toBe(ATTESTATION_URN);
		});
	});

	describe("get", () => {
		test("throws a guard error when id is empty", async () => {
			await expect(client.get("")).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("throws a guard error when id is not a URN", async () => {
			await expect(client.get("not-a-urn")).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.urn"
			});
		});

		test("sends GET to /{prefix}/{id}", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse(TEST_ATTESTATION_INFORMATION));

			await client.get(ATTESTATION_URN);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(`${ENDPOINT}/${PREFIX}/${ATTESTATION_URN}`);
			expect(options.method).toBe(HttpMethod.GET);
		});

		test("returns the attestation information", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse(TEST_ATTESTATION_INFORMATION));

			const result = await client.get(ATTESTATION_URN);

			expect(result).toEqual(TEST_ATTESTATION_INFORMATION);
		});
	});

	describe("transfer", () => {
		test("throws a guard error when attestationId is empty", async () => {
			await expect(client.transfer("", HOLDER_ADDRESS)).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("throws a guard error when attestationId is not a URN", async () => {
			await expect(client.transfer("not-a-urn", HOLDER_ADDRESS)).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.urn"
			});
		});

		test("throws a guard error when holderAddress is empty", async () => {
			await expect(client.transfer(ATTESTATION_URN, "")).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("sends PUT to /{prefix}/{id}/transfer", async () => {
			fetchMock.mockResolvedValueOnce(noContentResponse());

			await client.transfer(ATTESTATION_URN, HOLDER_ADDRESS);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(`${ENDPOINT}/${PREFIX}/${ATTESTATION_URN}/transfer`);
			expect(options.method).toBe(HttpMethod.PUT);
		});

		test("sends holderAddress in the request body", async () => {
			fetchMock.mockResolvedValueOnce(noContentResponse());

			await client.transfer(ATTESTATION_URN, HOLDER_ADDRESS);

			const [, options] = fetchMock.mock.calls[0];
			const body = JSON.parse(options.body);
			expect(body.holderAddress).toBe(HOLDER_ADDRESS);
		});

		test("resolves without a value", async () => {
			fetchMock.mockResolvedValueOnce(noContentResponse());

			const result = await client.transfer(ATTESTATION_URN, HOLDER_ADDRESS);

			expect(result).toBeUndefined();
		});
	});

	describe("destroy", () => {
		test("throws a guard error when attestationId is empty", async () => {
			await expect(client.destroy("")).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("throws a guard error when attestationId is not a URN", async () => {
			await expect(client.destroy("not-a-urn")).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.urn"
			});
		});

		test("sends DELETE to /{prefix}/{id}", async () => {
			fetchMock.mockResolvedValueOnce(noContentResponse());

			await client.destroy(ATTESTATION_URN);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(`${ENDPOINT}/${PREFIX}/${ATTESTATION_URN}`);
			expect(options.method).toBe(HttpMethod.DELETE);
		});

		test("resolves without a value", async () => {
			fetchMock.mockResolvedValueOnce(noContentResponse());

			const result = await client.destroy(ATTESTATION_URN);

			expect(result).toBeUndefined();
		});
	});
});
