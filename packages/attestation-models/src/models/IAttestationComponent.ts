// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IComponent } from "@3sixty/core";
import type { IJsonLdNodeObject } from "@3sixty/data-json-ld";
import type { IAttestationInformation } from "./IAttestationInformation.js";

/**
 * Interface describing an attestation contract.
 */
export interface IAttestationComponent extends IComponent {
	/**
	 * Attest the data and return the collated information.
	 * @param attestationObject The data to attest.
	 * @param namespace The namespace of the connector to use for the attestation, defaults to component configured namespace.
	 * @returns The id of the attestation.
	 */
	create(attestationObject: IJsonLdNodeObject, namespace?: string): Promise<string>;

	/**
	 * Resolve and verify the attestation id.
	 * @param id The attestation id to verify.
	 * @returns The verified attestation details.
	 */
	get(id: string): Promise<IAttestationInformation>;

	/**
	 * Transfer the attestation to a new holder.
	 * @param attestationId The attestation to transfer.
	 * @param holderAddress The address to transfer the attestation to.
	 * @returns A promise that resolves when the transfer is complete.
	 */
	transfer(attestationId: string, holderAddress: string): Promise<void>;

	/**
	 * Destroy the attestation.
	 * @param attestationId The attestation to destroy.
	 * @returns A promise that resolves when the attestation has been destroyed.
	 */
	destroy(attestationId: string): Promise<void>;
}
