// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdContextDefinitionElement, IJsonLdNodeObject } from "@3sixty/data-json-ld";
import type { SchemaOrgContexts } from "@3sixty/standards-schema-org";
import type { AttestationContexts } from "./attestationContexts.js";
import type { AttestationTypes } from "./attestationTypes.js";

/**
 * Interface describing the collated attestation information.
 */
export interface IAttestationInformation {
	/**
	 * JSON-LD Context.
	 */
	"@context": [
		typeof SchemaOrgContexts.Context,
		typeof AttestationContexts.Context,
		typeof AttestationContexts.ContextCommon,
		...IJsonLdContextDefinitionElement[]
	];

	/**
	 * JSON-LD Type.
	 */
	type: typeof AttestationTypes.Information;

	/**
	 * The unique identifier of the attestation.
	 */
	id: string;

	/**
	 * Created date/time of the attestation in ISO format.
	 * @json-ld namespace:schema
	 */
	dateCreated: string;

	/**
	 * Transferred date/time of the attestation in ISO format, can be blank if not yet transferred.
	 * @json-ld type:schema:Date
	 */
	dateTransferred?: string;

	/**
	 * The identity of the owner.
	 * @json-ld type:schema:identifier
	 */
	ownerIdentity: string;

	/**
	 * The data that was attested.
	 * @json-ld namespace:twin-common
	 */
	attestationObject: IJsonLdNodeObject;

	/**
	 * The proof for the attested data.
	 * @json-ld namespace:twin-attestation
	 */
	proof?: IJsonLdNodeObject;

	/**
	 * Whether the attestation has been verified.
	 * @json-ld namespace:twin-common
	 */
	verified?: boolean;

	/**
	 * The verification failure message.
	 * @json-ld type:schema:Text
	 */
	verificationFailure?: string;
}
