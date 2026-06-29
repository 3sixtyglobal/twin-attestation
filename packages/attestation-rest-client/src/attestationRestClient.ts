// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { BaseRestClient } from "@twin.org/api-core";
import {
	HttpHeaderHelper,
	type IBaseRestClientConfig,
	type ICreatedResponse,
	type INoContentResponse
} from "@twin.org/api-models";
import type {
	IAttestationComponent,
	IAttestationCreateRequest,
	IAttestationDestroyRequest,
	IAttestationGetRequest,
	IAttestationGetResponse,
	IAttestationInformation,
	IAttestationTransferRequest
} from "@twin.org/attestation-models";
import { Guards, Urn } from "@twin.org/core";
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";
import { nameof } from "@twin.org/nameof";
import { HttpMethod } from "@twin.org/web";

/**
 * Client for performing attestation through to REST endpoints.
 */
export class AttestationRestClient extends BaseRestClient implements IAttestationComponent {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<AttestationRestClient>();

	/**
	 * Create a new instance of AttestationRestClient.
	 * @param config The configuration for the client.
	 */
	constructor(config: IBaseRestClientConfig) {
		super(nameof<AttestationRestClient>(), config, "attestation");
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return AttestationRestClient.CLASS_NAME;
	}

	/**
	 * Attest the data and return the collated information.
	 * @param attestationObject The data to attest.
	 * @param namespace The namespace of the connector to use for the attestation, defaults to component configured namespace.
	 * @returns The id of the created attestation.
	 */
	public async create(attestationObject: IJsonLdNodeObject, namespace?: string): Promise<string> {
		Guards.object<IJsonLdNodeObject>(
			AttestationRestClient.CLASS_NAME,
			nameof(attestationObject),
			attestationObject
		);

		const response = await this.fetch<IAttestationCreateRequest, ICreatedResponse>(
			"/",
			HttpMethod.POST,
			{
				body: {
					attestationObject,
					namespace
				}
			}
		);

		return HttpHeaderHelper.extractId(response.headers);
	}

	/**
	 * Resolve and verify the attestation id.
	 * @param id The attestation id to verify.
	 * @returns The verified attestation details.
	 */
	public async get(id: string): Promise<IAttestationInformation> {
		Urn.guard(AttestationRestClient.CLASS_NAME, nameof(id), id);

		const response = await this.fetch<IAttestationGetRequest, IAttestationGetResponse>(
			"/:id",
			HttpMethod.GET,
			{
				pathParams: {
					id
				}
			}
		);

		return response.body;
	}

	/**
	 * Transfer the attestation to a new holder.
	 * @param attestationId The attestation to transfer.
	 * @param holderAddress The address to transfer the attestation to.
	 * @returns A promise that resolves when the transfer is complete.
	 */
	public async transfer(attestationId: string, holderAddress: string): Promise<void> {
		Urn.guard(AttestationRestClient.CLASS_NAME, nameof(attestationId), attestationId);
		Guards.stringValue(AttestationRestClient.CLASS_NAME, nameof(holderAddress), holderAddress);

		await this.fetch<IAttestationTransferRequest, INoContentResponse>(
			"/:id/transfer",
			HttpMethod.PUT,
			{
				pathParams: {
					id: attestationId
				},
				body: {
					holderAddress
				}
			}
		);
	}

	/**
	 * Destroy the attestation.
	 * @param attestationId The attestation to destroy.
	 * @returns A promise that resolves when the attestation has been destroyed.
	 */
	public async destroy(attestationId: string): Promise<void> {
		Urn.guard(AttestationRestClient.CLASS_NAME, nameof(attestationId), attestationId);

		await this.fetch<IAttestationDestroyRequest, INoContentResponse>("/:id", HttpMethod.DELETE, {
			pathParams: {
				id: attestationId
			}
		});
	}
}
