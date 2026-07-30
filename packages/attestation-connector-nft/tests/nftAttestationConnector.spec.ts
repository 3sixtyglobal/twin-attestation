// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Is } from "@twin.org/core";
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";
import { IdentityConnectorFactory } from "@twin.org/identity-models";
import { NftConnectorFactory } from "@twin.org/nft-models";
import {
	TEST_IDENTITY_ADDRESS_2,
	TEST_IDENTITY_CONNECTOR,
	TEST_IDENTITY_ID,
	setupTestEnv
} from "./setupTestEnv.js";
import { NftAttestationConnector } from "../src/nftAttestationConnector.js";
import { NftAttestationUtils } from "../src/nftAttestationUtils.js";

const TEST_IDENTITY_CONNECTOR_TYPE = "identity-revoked-test";
const TEST_NFT_CONNECTOR_TYPE = "nft-revoked-test";

const identityConnectorMock = {
	checkVerifiableCredential: async () => ({
		revoked: true,
		verifiableCredential: undefined
	})
};

const nftConnectorMock = {
	resolve: async () => ({
		immutableMetadata: {
			proof: "header.payload.signature"
		},
		metadata: {}
	})
};

let ownerIdentity: string;
let verificationMethodId: string;
let attestationId: string;

describe("NftAttestationConnector", () => {
	beforeAll(async () => {
		await setupTestEnv();

		const testIdentity = await TEST_IDENTITY_CONNECTOR.createDocument(TEST_IDENTITY_ID);
		ownerIdentity = testIdentity.id;

		const verificationMethod = await TEST_IDENTITY_CONNECTOR.addVerificationMethod(
			TEST_IDENTITY_ID,
			testIdentity.id,
			"assertionMethod",
			"attestation"
		);
		verificationMethodId = verificationMethod.id;
	});

	test("can construct", async () => {
		const attestation = new NftAttestationConnector();
		expect(attestation).toBeDefined();
	});

	test("can attest some data", async () => {
		const attestation = new NftAttestationConnector();

		const dataPayload: IJsonLdNodeObject = {
			"@context": "https://www.w3.org/ns/activitystreams",
			type: "Create",
			actor: {
				type: "Person",
				id: "acct:person@example.org",
				name: "Person"
			},
			object: {
				type: "Note",
				content: "This is a simple note"
			},
			published: "2015-01-25T12:34:56Z"
		};

		const attestedId = await attestation.create(
			TEST_IDENTITY_ID,
			verificationMethodId,
			dataPayload
		);

		expect(attestedId).toBeDefined();
		expect(attestedId.startsWith("attestation:nft")).toEqual(true);

		attestationId = attestedId;
	});

	test("can get an attestation", async () => {
		const attestation = new NftAttestationConnector();

		const attested = await attestation.get(attestationId);

		expect(attested).toBeDefined();
		expect(attested["@context"]).toEqual([
			"https://schema.org",
			"https://schema.twindev.org/attestation/",
			"https://schema.twindev.org/common/",
			"https://www.w3.org/ns/activitystreams"
		]);
		expect(attested.verified).toEqual(true);
		expect(attested.verificationFailure).toEqual(undefined);
		expect(attested.id?.startsWith("attestation:nft")).toEqual(true);
		expect(Is.dateTimeString(attested?.dateCreated)).toEqual(true);
		expect(attested.ownerIdentity).toEqual(ownerIdentity);
		expect(attested.dateTransferred).toEqual(undefined);
		expect(attested.attestationObject).toEqual({
			type: "Create",
			actor: {
				id: "acct:person@example.org",
				name: "Person",
				type: "Person"
			},
			object: {
				content: "This is a simple note",
				type: "Note"
			},
			published: "2015-01-25T12:34:56Z"
		});
		expect(attested.proof?.type).toEqual("JwtProof");
		expect((attested.proof?.value as string).split(".").length).toEqual(3);
	});

	test("can transfer an attestation", async () => {
		const attestation = new NftAttestationConnector();

		await attestation.transfer(TEST_IDENTITY_ID, attestationId, TEST_IDENTITY_ADDRESS_2);

		const transfered = await attestation.get(attestationId);

		expect(transfered).toBeDefined();
		expect(transfered.id.startsWith("attestation:nft")).toEqual(true);
		expect(Is.dateTimeString(transfered.dateCreated)).toEqual(true);
		expect(transfered.ownerIdentity).toEqual(ownerIdentity);
		expect(Is.dateTimeString(transfered.dateTransferred)).toEqual(true);
		expect(transfered.attestationObject).toEqual({
			type: "Create",
			actor: {
				id: "acct:person@example.org",
				name: "Person",
				type: "Person"
			},
			object: {
				content: "This is a simple note",
				type: "Note"
			},
			published: "2015-01-25T12:34:56Z"
		});
		expect(transfered.proof?.type).toEqual("JwtProof");
		expect((transfered.proof?.value as string).split(".").length).toEqual(3);
	});

	test("reports revoked when the credential is not returned", async () => {
		IdentityConnectorFactory.register(
			TEST_IDENTITY_CONNECTOR_TYPE,
			() => identityConnectorMock as never
		);
		NftConnectorFactory.register(TEST_NFT_CONNECTOR_TYPE, () => nftConnectorMock as never);

		const attestation = new NftAttestationConnector({
			identityConnectorType: TEST_IDENTITY_CONNECTOR_TYPE,
			nftConnectorType: TEST_NFT_CONNECTOR_TYPE
		});

		const testAttestationId = NftAttestationUtils.nftIdToAttestationId("urn:nft:test");
		const result = await attestation.get(testAttestationId);

		expect(result.verified).toEqual(false);
		expect(result.verificationFailure).toEqual(
			"NftAttestationConnector.verificationFailures.revoked"
		);
		expect(result.verificationFailure).not.toEqual(
			"NftAttestationConnector.verificationFailures.proofFailed"
		);
	});
});
