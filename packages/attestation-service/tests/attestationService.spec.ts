// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { HealthCategory, HealthStatus, type IHealth } from "@3sixty/api-models";
import { NftAttestationConnector } from "@3sixty/attestation-connector-nft";
import { AttestationConnectorFactory } from "@3sixty/attestation-models";
import { ContextIdKeys, ContextIdStore, type IContextIds } from "@3sixty/context";
import { MemoryEntityStorageConnector } from "@3sixty/entity-storage-connector-memory";
import { EntityStorageConnectorFactory } from "@3sixty/entity-storage-models";
import {
	EntityStorageIdentityConnector,
	type IdentityDocument,
	initSchema as initSchemaIdentity
} from "@3sixty/identity-connector-entity-storage";
import { IdentityConnectorFactory } from "@3sixty/identity-models";
import { nameof } from "@3sixty/nameof";
import {
	EntityStorageNftConnector,
	initSchema as initSchemaNft,
	type Nft
} from "@3sixty/nft-connector-entity-storage";
import { NftConnectorFactory } from "@3sixty/nft-models";
import { DidVerificationMethodType } from "@3sixty/standards-w3c-did";
import {
	EntityStorageVaultConnector,
	type VaultKey,
	type VaultSecret,
	initSchema as initSchemaVault
} from "@3sixty/vault-connector-entity-storage";
import { VaultConnectorFactory } from "@3sixty/vault-models";
import type { IWalletConnector } from "@3sixty/wallet-models";
import { WalletConnectorFactory } from "@3sixty/wallet-models";
import { AttestationService } from "../src/attestationService.js";

const TEST_CONTROLLER = "test-controller";

describe("AttestationService", () => {
	beforeAll(() => {
		initSchemaVault();
		initSchemaIdentity();
		initSchemaNft();
	});

	test("Can create an instance", async () => {
		AttestationConnectorFactory.register(
			NftAttestationConnector.NAMESPACE,
			() => new NftAttestationConnector()
		);
		WalletConnectorFactory.register("wallet", () => ({}) as IWalletConnector);
		const service = new AttestationService();
		expect(service).toBeDefined();
	});

	describe("health checks", () => {
		// Each test needs isolated storage because MemoryEntityStorageConnector uses
		// SharedObjectBuffer keyed by storageKey, so instances sharing a key share data.
		let healthTestIndex = 0;

		beforeEach(() => {
			healthTestIndex++;
			const idx = healthTestIndex;

			const freshVaultKeyStorage = new MemoryEntityStorageConnector<VaultKey>({
				entitySchema: nameof<VaultKey>(),
				config: { storageKey: `vault-key-ahealth-${idx}` }
			});
			const freshVaultSecretStorage = new MemoryEntityStorageConnector<VaultSecret>({
				entitySchema: nameof<VaultSecret>(),
				config: { storageKey: `vault-secret-ahealth-${idx}` }
			});
			const freshIdentityDocStorage = new MemoryEntityStorageConnector<IdentityDocument>({
				entitySchema: nameof<IdentityDocument>(),
				config: { storageKey: `identity-doc-ahealth-${idx}` }
			});
			const freshNftStorage = new MemoryEntityStorageConnector<Nft>({
				entitySchema: nameof<Nft>(),
				config: { storageKey: `nft-ahealth-${idx}` }
			});

			EntityStorageConnectorFactory.register("vault-key", () => freshVaultKeyStorage);
			EntityStorageConnectorFactory.register("vault-secret", () => freshVaultSecretStorage);
			EntityStorageConnectorFactory.register("identity-document", () => freshIdentityDocStorage);
			EntityStorageConnectorFactory.register("nft", () => freshNftStorage);

			// Re-register to evict cached connector instances so each test starts fresh
			VaultConnectorFactory.register("vault", () => new EntityStorageVaultConnector());
			IdentityConnectorFactory.register(
				"entity-storage",
				() => new EntityStorageIdentityConnector()
			);
			// NftAttestationConnector uses "identity" as its default identity connector type
			IdentityConnectorFactory.register("identity", () => new EntityStorageIdentityConnector());
			NftConnectorFactory.register("nft", () => new EntityStorageNftConnector());
			AttestationConnectorFactory.register("nft", () => new NftAttestationConnector());
		});

		test("healthApplication returns ok after full lifecycle", async () => {
			const service = new AttestationService();

			const identityConnector = IdentityConnectorFactory.get("entity-storage");
			const doc = await identityConnector.createDocument(TEST_CONTROLLER);
			await identityConnector.addVerificationMethod(
				TEST_CONTROLLER,
				doc.id,
				DidVerificationMethodType.AssertionMethod,
				"health-assertion"
			);

			const contextIds: IContextIds = {
				[ContextIdKeys.Node]: TEST_CONTROLLER,
				[ContextIdKeys.Organization]: doc.id
			};

			let results: IHealth[] = [];
			await ContextIdStore.run(contextIds, async () => {
				results = (await service.healthApplication(async () => {})) ?? [];
			});

			expect(results).toHaveLength(1);
			expect(results[0].category).toEqual(HealthCategory.Application);
			expect(results[0].status).toEqual(HealthStatus.Ok);
		});

		test("healthApplication returns empty array when no organization context", async () => {
			const service = new AttestationService();

			let results: IHealth[] = [];
			await ContextIdStore.run({}, async () => {
				results = (await service.healthApplication(async () => {})) ?? [];
			});

			expect(results).toHaveLength(0);
		});
	});
});
