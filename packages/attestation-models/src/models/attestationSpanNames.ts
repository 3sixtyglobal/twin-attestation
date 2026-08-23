// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The span names for the attestation domain.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const AttestationSpanNames = {
	/**
	 * Create an attestation.
	 */
	Create: "attestation/create",

	/**
	 * Get an attestation.
	 */
	Get: "attestation/get",

	/**
	 * Transfer an attestation.
	 */
	Transfer: "attestation/transfer",

	/**
	 * Destroy an attestation.
	 */
	Destroy: "attestation/destroy"
} as const;

/**
 * Union type of all attestation span name string values.
 */
export type AttestationSpanNames = (typeof AttestationSpanNames)[keyof typeof AttestationSpanNames];
