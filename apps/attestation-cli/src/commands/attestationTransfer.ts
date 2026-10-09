// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { NftAttestationConnector, NftAttestationUtils } from "@3sixty/attestation-connector-nft";
import { CLIDisplay, CLIParam } from "@3sixty/cli-core";
import { Converter, I18n, Is, StringHelper } from "@3sixty/core";
import { IdentityConnectorTypes, setupIdentityConnector } from "@3sixty/identity-cli";
import { IdentityConnectorFactory } from "@3sixty/identity-models";
import { setupNftConnector } from "@3sixty/nft-cli";
import { IotaNftUtils } from "@3sixty/nft-connector-iota";
import { NftConnectorFactory } from "@3sixty/nft-models";
import { VaultConnectorFactory } from "@3sixty/vault-models";
import { setupWalletConnector, WalletConnectorTypes } from "@3sixty/wallet-cli";
import { WalletConnectorFactory } from "@3sixty/wallet-models";
import { Command } from "commander";
import { setupVault } from "./setupCommands.js";

/**
 * Build the attestation transfer command for the CLI.
 * @returns The command.
 */
export function buildCommandAttestationTransfer(): Command {
	const command = new Command();
	command
		.name("attestation-transfer")
		.summary(I18n.formatMessage("commands.attestation-transfer.summary"))
		.description(I18n.formatMessage("commands.attestation-transfer.description"))
		.requiredOption(
			I18n.formatMessage("commands.attestation-transfer.options.seed.param"),
			I18n.formatMessage("commands.attestation-transfer.options.seed.description")
		)
		.requiredOption(
			I18n.formatMessage("commands.attestation-transfer.options.id.param"),
			I18n.formatMessage("commands.attestation-transfer.options.id.description")
		)
		.requiredOption(
			I18n.formatMessage("commands.attestation-transfer.options.holder-address.param"),
			I18n.formatMessage("commands.attestation-transfer.options.holder-address.description")
		);

	command
		.option(
			I18n.formatMessage("commands.common.options.node.param"),
			I18n.formatMessage("commands.common.options.node.description"),
			"!NODE_URL"
		)
		.option(
			I18n.formatMessage("commands.common.options.network.param"),
			I18n.formatMessage("commands.common.options.network.description"),
			"!NETWORK"
		)
		.option(
			I18n.formatMessage("commands.common.options.explorer.param"),
			I18n.formatMessage("commands.common.options.explorer.description"),
			"!EXPLORER_URL"
		)
		.action(actionCommandAttestationTransfer);

	return command;
}

/**
 * Action the attestation transfer command.
 * @param opts The options for the command.
 * @param opts.seed The seed required for signing by the issuer.
 * @param opts.id The id of the attestation to transfer in urn format.
 * @param opts.holderAddress The new holder address of the attestation.
 * @param opts.node The node URL.
 * @param opts.network The network to use for connector.
 * @param opts.explorer The explorer URL.
 */
export async function actionCommandAttestationTransfer(opts: {
	seed: string;
	id: string;
	holderAddress: string;
	node: string;
	network?: string;
	explorer: string;
}): Promise<void> {
	const seed: Uint8Array = CLIParam.hexBase64("seed", opts.seed);
	const id: string = CLIParam.stringValue("id", opts.id);
	const holderAddress: string = Converter.bytesToHex(
		CLIParam.hex("holderAddress", opts.holderAddress),
		true
	);
	const network: string | undefined = CLIParam.stringValue("network", opts.network);
	const nodeEndpoint: string = CLIParam.url("node", opts.node);
	const explorerEndpoint: string = CLIParam.url("explorer", opts.explorer);

	CLIDisplay.value(I18n.formatMessage("commands.attestation-transfer.labels.attestationId"), id);
	CLIDisplay.value(
		I18n.formatMessage("commands.attestation-transfer.labels.holderAddress"),
		holderAddress
	);
	CLIDisplay.value(I18n.formatMessage("commands.common.labels.node"), nodeEndpoint);
	if (Is.stringValue(network)) {
		CLIDisplay.value(I18n.formatMessage("commands.common.labels.network"), network);
	}
	CLIDisplay.break();

	setupVault();

	const localIdentity = "identity";
	const vaultSeedId = "local-seed";

	const vaultConnector = VaultConnectorFactory.get("vault");
	await vaultConnector.setSecret(`${localIdentity}/${vaultSeedId}`, Converter.bytesToBase64(seed));

	const identityConnector = setupIdentityConnector(
		{ nodeEndpoint, network, vaultSeedId },
		IdentityConnectorTypes.Iota
	);
	IdentityConnectorFactory.register("identity", () => identityConnector);

	const walletConnector = setupWalletConnector(
		{ nodeEndpoint, network, vaultSeedId },
		WalletConnectorTypes.Iota
	);
	WalletConnectorFactory.register("wallet", () => walletConnector);

	const nftConnector = setupNftConnector({ nodeEndpoint, network, vaultSeedId });
	NftConnectorFactory.register("nft", () => nftConnector);

	const attestationConnector = new NftAttestationConnector();

	CLIDisplay.task(
		I18n.formatMessage("commands.attestation-transfer.progress.transferringAttestation")
	);
	CLIDisplay.break();

	CLIDisplay.spinnerStart();

	await attestationConnector.transfer(localIdentity, id, holderAddress);

	CLIDisplay.spinnerStop();

	const nftId = NftAttestationUtils.attestationIdToNftId(id);

	CLIDisplay.value(
		I18n.formatMessage("commands.common.labels.explore"),
		`${StringHelper.trimTrailingSlashes(explorerEndpoint)}/object/${IotaNftUtils.nftIdToObjectId(nftId)}?network=${network}`
	);
	CLIDisplay.break();

	CLIDisplay.done();
}
