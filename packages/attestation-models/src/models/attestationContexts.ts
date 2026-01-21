// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The contexts of attestation data.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const AttestationContexts = {
	/**
	 * The canonical RDF namespace URI for Attestation.
	 */
	Namespace: "https://schema.twindev.org/attestation/",

	/**
	 * The value to use in context for Attestation.
	 */
	Context: "https://schema.twindev.org/attestation/",

	/**
	 * The JSON-LD Context URL for Attestation.
	 */
	JsonLdContext: "https://schema.twindev.org/attestation/types.jsonld",

	/**
	 * The canonical RDF namespace URI for TWIN Common.
	 */
	NamespaceCommon: "https://schema.twindev.org/common/",

	/**
	 * The value to use in JSON-LD context for TWIN Common.
	 */
	ContextCommon: "https://schema.twindev.org/common/",

	/**
	 * The JSON-LD Context URL for TWIN Common.
	 */
	JsonLdContextCommon: "https://schema.twindev.org/common/types.jsonld"
} as const;

/**
 * The contexts of attestation data.
 */
export type AttestationContexts = (typeof AttestationContexts)[keyof typeof AttestationContexts];
