// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdContextDefinitionElement, IJsonLdNodeObject } from "@twin.org/data-json-ld";
import type { SchemaOrgContexts } from "@twin.org/standards-schema-org";
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
		typeof AttestationContexts.Context,
		typeof AttestationContexts.ContextCommon,
		typeof SchemaOrgContexts.Context,
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
	 * json-ld namespace:schema
	 */
	dateCreated: string;

	/**
	 * Transferred date/time of the attestation in ISO format, can be blank if holder identity is owner.
	 * json-ld type:schema:Date
	 */
	dateTransferred?: string;

	/**
	 * The identity of the owner.
	 * json-ld type:schema:identifier
	 */
	ownerIdentity: string;

	/**
	 * The identity of the current holder, can be undefined if owner is still the holder.
	 * json-ld type:schema:identifier
	 */
	holderIdentity?: string;

	/**
	 * The data that was attested.
	 * json-ld namespace:twin-common
	 */
	attestationObject: IJsonLdNodeObject;

	/**
	 * The proof for the attested data.
	 * json-ld namespace:twin-attestation
	 */
	proof?: IJsonLdNodeObject;

	/**
	 * Whether the attestation has been verified.
	 * json-ld namespace:twin-common
	 */
	verified?: boolean;

	/**
	 * The verification failure message.
	 * json-ld type:schema:Text
	 */
	verificationFailure?: string;
}
