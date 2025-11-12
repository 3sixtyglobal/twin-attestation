// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	AttestationConnectorFactory,
	type IAttestationComponent,
	type IAttestationConnector,
	type IAttestationInformation
} from "@twin.org/attestation-models";
import { ContextIdHelper, ContextIdKeys, ContextIdStore } from "@twin.org/context";
import { GeneralError, Guards, Urn } from "@twin.org/core";
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";
import { nameof } from "@twin.org/nameof";
import type { IAttestationServiceConstructorOptions } from "./models/IAttestationServiceConstructorOptions.js";

/**
 * Service for performing attestation operations to a connector.
 */
export class AttestationService implements IAttestationComponent {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<AttestationService>();

	/**
	 * The namespace supported by the attestation service.
	 * @internal
	 */
	private static readonly _NAMESPACE: string = "attestation";

	/**
	 * The default namespace for the connector to use.
	 * @internal
	 */
	private readonly _defaultNamespace: string;

	/**
	 * The verification method id to use for the attestation.
	 * @internal
	 */
	private readonly _verificationMethodId: string;

	/**
	 * Create a new instance of AttestationService.
	 * @param options The options for the service.
	 * @param options.config The configuration for the service.
	 */
	constructor(options?: IAttestationServiceConstructorOptions) {
		const names = AttestationConnectorFactory.names();
		if (names.length === 0) {
			throw new GeneralError(AttestationService.CLASS_NAME, "noConnectors");
		}

		this._defaultNamespace = options?.config?.defaultNamespace ?? names[0];
		this._verificationMethodId = options?.config?.verificationMethodId ?? "attestation-assertion";
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return AttestationService.CLASS_NAME;
	}

	/**
	 * Attest the data and return the collated information.
	 * @param attestationObject The data to attest.
	 * @param namespace The namespace of the connector to use for the attestation, defaults to service configured namespace.
	 * @returns The id.
	 */
	public async create(attestationObject: IJsonLdNodeObject, namespace?: string): Promise<string> {
		Guards.object<IJsonLdNodeObject>(
			AttestationService.CLASS_NAME,
			nameof(attestationObject),
			attestationObject
		);

		const contextIds = await ContextIdStore.getContextIds();
		ContextIdHelper.guard(contextIds, ContextIdKeys.Organization);

		try {
			const connectorNamespace = namespace ?? this._defaultNamespace;

			const attestationConnector =
				AttestationConnectorFactory.get<IAttestationConnector>(connectorNamespace);

			const result = await attestationConnector.create(
				contextIds[ContextIdKeys.Organization],
				`${contextIds[ContextIdKeys.Organization]}#${this._verificationMethodId}`,
				attestationObject
			);
			return result;
		} catch (error) {
			throw new GeneralError(AttestationService.CLASS_NAME, "attestFailed", undefined, error);
		}
	}

	/**
	 * Resolve and verify the attestation id.
	 * @param id The attestation id to verify.
	 * @returns The verified attestation details.
	 */
	public async get(id: string): Promise<IAttestationInformation> {
		Urn.guard(AttestationService.CLASS_NAME, nameof(id), id);

		try {
			const attestationConnector = this.getConnector(id);

			const result = await attestationConnector.get(id);
			return result;
		} catch (error) {
			throw new GeneralError(AttestationService.CLASS_NAME, "verifyFailed", undefined, error);
		}
	}

	/**
	 * Transfer the attestation to a new holder.
	 * @param attestationId The attestation to transfer.
	 * @param holderIdentity The identity to transfer the attestation to.
	 * @param holderAddress The address to transfer the attestation to.
	 * @returns The updated attestation details.
	 */
	public async transfer(
		attestationId: string,
		holderIdentity: string,
		holderAddress: string
	): Promise<void> {
		Urn.guard(AttestationService.CLASS_NAME, nameof(attestationId), attestationId);
		Guards.stringValue(AttestationService.CLASS_NAME, nameof(holderIdentity), holderIdentity);
		Guards.stringValue(AttestationService.CLASS_NAME, nameof(holderAddress), holderAddress);

		const contextIds = await ContextIdStore.getContextIds();
		ContextIdHelper.guard(contextIds, ContextIdKeys.Organization);

		try {
			const attestationConnector = this.getConnector(attestationId);

			const result = await attestationConnector.transfer(
				contextIds.organization,
				attestationId,
				holderIdentity,
				holderAddress
			);
			return result;
		} catch (error) {
			throw new GeneralError(AttestationService.CLASS_NAME, "transferFailed", undefined, error);
		}
	}

	/**
	 * Destroy the attestation.
	 * @param attestationId The attestation to transfer.
	 * @returns The updated attestation details.
	 */
	public async destroy(attestationId: string): Promise<void> {
		Urn.guard(AttestationService.CLASS_NAME, nameof(attestationId), attestationId);

		const contextIds = await ContextIdStore.getContextIds();
		ContextIdHelper.guard(contextIds, ContextIdKeys.Organization);

		try {
			const attestationConnector = this.getConnector(attestationId);

			const result = await attestationConnector.destroy(
				contextIds[ContextIdKeys.Organization],
				attestationId
			);
			return result;
		} catch (error) {
			throw new GeneralError(AttestationService.CLASS_NAME, "destroyFailed", undefined, error);
		}
	}

	/**
	 * Get the connector from the uri.
	 * @param id The id of the attestation in urn format.
	 * @returns The connector.
	 * @internal
	 */
	private getConnector(id: string): IAttestationConnector {
		const idUri = Urn.fromValidString(id);

		if (idUri.namespaceIdentifier() !== AttestationService._NAMESPACE) {
			throw new GeneralError(AttestationService.CLASS_NAME, "namespaceMismatch", {
				namespace: AttestationService._NAMESPACE,
				id
			});
		}

		return AttestationConnectorFactory.get<IAttestationConnector>(idUri.namespaceMethod());
	}
}
