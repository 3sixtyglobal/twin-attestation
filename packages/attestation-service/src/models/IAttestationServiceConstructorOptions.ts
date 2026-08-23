// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAttestationServiceConfig } from "./IAttestationServiceConfig.js";

/**
 * Options for the attestation service constructor.
 */
export interface IAttestationServiceConstructorOptions {
	/**
	 * The configuration for the service.
	 */
	config?: IAttestationServiceConfig;

	/**
	 * The component type for the optional telemetry component used for event metrics.
	 */
	telemetryComponentType?: string;

	/**
	 * The component type for the optional tracing component used for spans.
	 */
	tracingComponentType?: string;
}
