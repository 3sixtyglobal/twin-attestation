// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdContextDefinitionElement } from "@3sixty/data-json-ld";
import type { AttestationContexts } from "./attestationContexts.js";
import type { AttestationTypes } from "./attestationTypes.js";

/**
 * Interface describing an attestation proof.
 */
export interface IAttestationJwtProof {
	/**
	 * JSON-LD Context.
	 */
	"@context":
		| typeof AttestationContexts.Context
		| [typeof AttestationContexts.Context, ...IJsonLdContextDefinitionElement[]];

	/**
	 * The type of the proof.
	 */
	type: typeof AttestationTypes.JwtProof;

	/**
	 * The value of the proof.
	 * @json-ld type:schema:Text
	 */
	value: string;
}
