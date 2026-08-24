// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Metric IDs for the attestation service.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const AttestationMetricIds = {
	/**
	 * Number of attestations created.
	 */
	AttestationCreated: "att_attestations_created",

	/**
	 * Number of attestation verifications succeeded.
	 */
	AttestationVerified: "att_attestations_verified",

	/**
	 * Number of attestation verifications failed.
	 */
	AttestationVerificationFailed: "att_attestations_verification_failed",

	/**
	 * Number of attestations transferred.
	 */
	AttestationTransferred: "att_attestations_transferred",

	/**
	 * Number of attestations destroyed.
	 */
	AttestationDestroyed: "att_attestations_destroyed"
} as const;

/**
 * Union type of all attestation service metric ID string values.
 */
export type AttestationMetricIds = (typeof AttestationMetricIds)[keyof typeof AttestationMetricIds];
