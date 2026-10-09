// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { MemoryEntityStorageConnector } from "@3sixty/entity-storage-connector-memory";
import { EntityStorageConnectorFactory } from "@3sixty/entity-storage-models";
import { nameof } from "@3sixty/nameof";
import {
	EntityStorageVaultConnector,
	type VaultKey,
	type VaultSecret,
	initSchema
} from "@3sixty/vault-connector-entity-storage";
import { VaultConnectorFactory } from "@3sixty/vault-models";

/**
 * Setup the vault for use in the CLI commands.
 */
export function setupVault(): void {
	initSchema();

	EntityStorageConnectorFactory.register(
		"vault-key",
		() =>
			new MemoryEntityStorageConnector<VaultKey>({
				entitySchema: nameof<VaultKey>(),
				config: { storageKey: "vault-key" }
			})
	);
	EntityStorageConnectorFactory.register(
		"vault-secret",
		() =>
			new MemoryEntityStorageConnector<VaultSecret>({
				entitySchema: nameof<VaultSecret>(),
				config: { storageKey: "vault-secret" }
			})
	);

	const vaultConnector = new EntityStorageVaultConnector();
	VaultConnectorFactory.register("vault", () => vaultConnector);
}
