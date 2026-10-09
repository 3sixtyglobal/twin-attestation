// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	HealthCategory,
	HealthStatus,
	type HealthApplicationCallback,
	type IHealth,
	type IHealthProviderComponent
} from "@3sixty/api-models";
import {
	AttestationConnectorFactory,
	AttestationMetricIds,
	AttestationMetrics,
	type IAttestationComponent,
	type IAttestationConnector,
	type IAttestationInformation
} from "@3sixty/attestation-models";
import { ContextIdHelper, ContextIdKeys, ContextIdStore } from "@3sixty/context";
import { ComponentFactory, BaseError, GeneralError, Guards, Is, Urn } from "@3sixty/core";
import type { IJsonLdNodeObject } from "@3sixty/data-json-ld";
import { nameof } from "@3sixty/nameof";
import { MetricHelper, type ITelemetryComponent } from "@3sixty/telemetry-models";
import type { IAttestationServiceConstructorOptions } from "./models/IAttestationServiceConstructorOptions.js";

/**
 * Service for performing attestation operations to a connector.
 */
export class AttestationService implements IAttestationComponent, IHealthProviderComponent {
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
	 * The optional telemetry component used for event metrics.
	 * @internal
	 */
	private readonly _telemetryComponent?: ITelemetryComponent;

	/**
	 * Create a new instance of AttestationService.
	 * @param options The options for the service.
	 * @param options.config The configuration for the service.
	 * @throws GeneralError If no attestation connectors are registered.
	 */
	constructor(options?: IAttestationServiceConstructorOptions) {
		const names = AttestationConnectorFactory.names();
		if (names.length === 0) {
			throw new GeneralError(AttestationService.CLASS_NAME, "noConnectors");
		}

		this._defaultNamespace = options?.config?.defaultNamespace ?? names[0];
		this._verificationMethodId = options?.config?.verificationMethodId ?? "attestation-assertion";

		this._telemetryComponent = ComponentFactory.getIfExists<ITelemetryComponent>(
			options?.telemetryComponentType
		);
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return AttestationService.CLASS_NAME;
	}

	/**
	 * Runs a full attestation lifecycle (create, get, destroy) against the organisation identity
	 * in the current context and returns the result directly.
	 * @param callback The callback to invoke when a deferred health result is ready.
	 * @returns The health status of the service.
	 */
	public async healthApplication(
		callback: HealthApplicationCallback
	): Promise<IHealth[] | undefined> {
		const contextIds = (await ContextIdStore.getContextIds()) ?? {};
		const orgDid = contextIds[ContextIdKeys.Organization];

		if (!Is.stringValue(orgDid)) {
			return [];
		}

		try {
			const connector = AttestationConnectorFactory.get<IAttestationConnector>(
				this._defaultNamespace
			);
			const attestationId = await connector.create(orgDid, `${orgDid}#health-assertion`, {
				"@context": "https://schema.org",
				"@type": "Thing",
				name: "Health Check"
			});
			const info = await connector.get(attestationId);
			await connector.destroy(orgDid, attestationId);
			return [
				{
					source: AttestationService.CLASS_NAME,
					category: HealthCategory.Application,
					status: Is.object(info) ? HealthStatus.Ok : HealthStatus.Error,
					description: "healthDescription",
					message: Is.object(info) ? undefined : "getAttestationFailed",
					data: {
						attestationId
					}
				}
			];
		} catch (error) {
			return [
				{
					source: AttestationService.CLASS_NAME,
					category: HealthCategory.Application,
					status: HealthStatus.Error,
					description: "healthDescription",
					message: "getAttestationFailed",
					error: BaseError.fromError(error)
				}
			];
		}
	}

	/**
	 * Register all attestation metrics with the telemetry component.
	 * @returns A promise that resolves when all metrics have been registered.
	 */
	public async start(): Promise<void> {
		if (!Is.undefined(this._telemetryComponent)) {
			await MetricHelper.createMetrics(this._telemetryComponent, AttestationMetrics);
		}
	}

	/**
	 * Attest the data and return the collated information.
	 * @param attestationObject The data to attest.
	 * @param namespace The namespace of the connector to use for the attestation, defaults to service configured namespace.
	 * @returns The id of the created attestation.
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

			await MetricHelper.metricIncrement(
				this._telemetryComponent,
				AttestationMetricIds.AttestationCreated,
				{ namespace: connectorNamespace }
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

			if (result.verified === true) {
				await MetricHelper.metricIncrement(
					this._telemetryComponent,
					AttestationMetricIds.AttestationVerified
				);
			} else {
				await MetricHelper.metricIncrement(
					this._telemetryComponent,
					AttestationMetricIds.AttestationVerificationFailed,
					{ failureReason: result.verificationFailure }
				);
			}

			return result;
		} catch (error) {
			throw new GeneralError(AttestationService.CLASS_NAME, "verifyFailed", undefined, error);
		}
	}

	/**
	 * Transfer the attestation to a new holder.
	 * @param attestationId The attestation to transfer.
	 * @param holderAddress The address to transfer the attestation to.
	 * @returns A promise that resolves when the transfer is complete.
	 */
	public async transfer(attestationId: string, holderAddress: string): Promise<void> {
		Urn.guard(AttestationService.CLASS_NAME, nameof(attestationId), attestationId);
		Guards.stringValue(AttestationService.CLASS_NAME, nameof(holderAddress), holderAddress);

		const contextIds = await ContextIdStore.getContextIds();
		ContextIdHelper.guard(contextIds, ContextIdKeys.Organization);

		try {
			const attestationConnector = this.getConnector(attestationId);

			const result = await attestationConnector.transfer(
				contextIds.organization,
				attestationId,
				holderAddress
			);

			await MetricHelper.metricIncrement(
				this._telemetryComponent,
				AttestationMetricIds.AttestationTransferred
			);

			return result;
		} catch (error) {
			throw new GeneralError(AttestationService.CLASS_NAME, "transferFailed", undefined, error);
		}
	}

	/**
	 * Destroy the attestation.
	 * @param attestationId The attestation to destroy.
	 * @returns A promise that resolves when the attestation has been destroyed.
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

			await MetricHelper.metricIncrement(
				this._telemetryComponent,
				AttestationMetricIds.AttestationDestroyed
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
	 * @throws GeneralError if the namespace does not match.
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
