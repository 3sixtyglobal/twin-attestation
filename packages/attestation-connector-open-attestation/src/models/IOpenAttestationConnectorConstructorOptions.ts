// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IOpenAttestationConnectorConfig } from "./IOpenAttestationConnectorConfig.js";

/**
 * Options for the Open Attestation connector constructor.
 */
export interface IOpenAttestationConnectorConstructorOptions {
	/**
	 * The configuration for the connector.
	 */
	config?: IOpenAttestationConnectorConfig;
}
