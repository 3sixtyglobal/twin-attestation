// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The span attribute keys for the attestation domain.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const AttestationSpanAttributes = {
	/**
	 * The id of the attestation the operation is for.
	 */
	Id: "attestation.id"
} as const;

/**
 * Union type of all attestation span attribute key string values.
 */
export type AttestationSpanAttributes =
	(typeof AttestationSpanAttributes)[keyof typeof AttestationSpanAttributes];
