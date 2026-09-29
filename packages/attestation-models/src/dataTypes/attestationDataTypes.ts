// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { DataTypeHandlerFactory } from "@twin.org/data-core";
import { JsonLdDataTypes } from "@twin.org/data-json-ld";
import * as CompiledValidators from "../compiled/validators.js";
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
		// Register the types referenced by the schemas, which are only registered once.
		JsonLdDataTypes.registerTypes();

		DataTypeHandlerFactory.register(
			`${AttestationContexts.Namespace}${AttestationTypes.Information}`,
			() => ({
				namespace: AttestationContexts.Namespace,
				type: AttestationTypes.Information,
				defaultValue: {},
				jsonSchema: async () => AttestationInformationSchema,
				compiledValidator: async () => CompiledValidators.CompiledAttestationInformation
			})
		);
		DataTypeHandlerFactory.register(
			`${AttestationContexts.Namespace}${AttestationTypes.JwtProof}`,
			() => ({
				namespace: AttestationContexts.Namespace,
				type: AttestationTypes.JwtProof,
				defaultValue: {},
				jsonSchema: async () => AttestationJwtProofSchema,
				compiledValidator: async () => CompiledValidators.CompiledAttestationJwtProof
			})
		);
	}
}
