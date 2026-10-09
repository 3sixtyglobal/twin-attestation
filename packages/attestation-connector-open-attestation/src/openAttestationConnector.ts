// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAttestationConnector, IAttestationInformation } from "@3sixty/attestation-models";
import { NotImplementedError } from "@3sixty/core";
import type { IJsonLdNodeObject } from "@3sixty/data-json-ld";
import { nameof } from "@3sixty/nameof";
import type { IOpenAttestationConnectorConstructorOptions } from "./models/IOpenAttestationConnectorConstructorOptions.js";

/**
 * Class for performing attestation operations using the Open Attestation standard.
 */
export class OpenAttestationConnector implements IAttestationConnector {
	/**
	 * The namespace for the entities.
	 */
	public static readonly NAMESPACE: string = "open-attestation";

	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<OpenAttestationConnector>();

	/**
	 * Create a new instance of OpenAttestationConnector.
	 * @param options The options for the attestation connector.
	 */
	// eslint-disable-next-line @typescript-eslint/no-useless-constructor
	constructor(options: IOpenAttestationConnectorConstructorOptions) {}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return OpenAttestationConnector.CLASS_NAME;
	}

	/**
	 * Attest the data and return the collated information.
	 * @param controller The controller identity of the user to access the vault keys.
	 * @param verificationMethodId The identity verification method to use for attesting the data.
	 * @param attestationObject The data to attest.
	 * @returns The id of the created attestation.
	 */
	public async create(
		controller: string,
		verificationMethodId: string,
		attestationObject: IJsonLdNodeObject
	): Promise<string> {
		throw new NotImplementedError(OpenAttestationConnector.CLASS_NAME, "attest");
	}

	/**
	 * Resolve and verify the attestation id.
	 * @param id The attestation id to verify.
	 * @returns The verified attestation details.
	 */
	public async get(id: string): Promise<IAttestationInformation> {
		throw new NotImplementedError(OpenAttestationConnector.CLASS_NAME, "verify");
	}

	/**
	 * Transfer the attestation to a new holder.
	 * @param controller The controller identity of the user to access the vault keys.
	 * @param attestationId The attestation to transfer.
	 * @param holderAddress The new controller address of the attestation belonging to the holder.
	 * @returns A promise that resolves when the transfer is complete.
	 */
	public async transfer(
		controller: string,
		attestationId: string,
		holderAddress: string
	): Promise<void> {
		throw new NotImplementedError(OpenAttestationConnector.CLASS_NAME, "transfer");
	}

	/**
	 * Destroy the attestation.
	 * @param controller The controller identity of the user to access the vault keys.
	 * @param attestationId The attestation to destroy.
	 * @returns A promise that resolves when the attestation has been destroyed.
	 */
	public async destroy(controller: string, attestationId: string): Promise<void> {
		throw new NotImplementedError(OpenAttestationConnector.CLASS_NAME, "destroy");
	}
}
