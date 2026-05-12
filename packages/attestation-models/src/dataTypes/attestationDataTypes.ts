// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { DataTypeHandlerFactory } from "@twin.org/data-core";
import { AttestationContexts } from "../models/attestationContexts.js";
import { AttestationTypes } from "../models/attestationTypes.js";
import AttestationInformationSchema from "../schemas/AttestationInformation.json" with { type: "json" };
import AttestationJwtProofSchema from "../schemas/AttestationJwtProof.json" with { type: "json" };

/**
 * Handle all the data types for attestation.
 */
export class AttestationDataTypes {
	/**
	 * Register all the data types.
	 */
	public static registerTypes(): void {
		DataTypeHandlerFactory.register(
			`${AttestationContexts.Namespace}${AttestationTypes.Information}`,
			() => ({
				namespace: AttestationContexts.Namespace,
				type: AttestationTypes.Information,
				defaultValue: {},
				jsonSchema: async () => AttestationInformationSchema
			})
		);
		DataTypeHandlerFactory.register(
			`${AttestationContexts.Namespace}${AttestationTypes.JwtProof}`,
			() => ({
				namespace: AttestationContexts.Namespace,
				type: AttestationTypes.JwtProof,
				defaultValue: {},
				jsonSchema: async () => AttestationJwtProofSchema
			})
		);
	}
}
