// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Model for the owner of an attestation.
 */
export interface INftAttestationHolder {
	/**
	 * The holder identity the attestation was transferred to.
	 */
	holderIdentity?: string;

	/**
	 * The ISO date/time when the attestation was transferred, if not provided defaults to issued date.
	 */
	dateTransferred?: string;
}
