// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { type ITelemetryMetric, MetricType } from "@twin.org/telemetry-models";
import { AttestationMetricIds } from "./attestationMetricIds.js";

/**
 * Metrics registered by the attestation service.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const AttestationMetrics: ITelemetryMetric[] = [
	{
		id: AttestationMetricIds.AttestationCreated,
		label: "Attestations created",
		type: MetricType.Counter
	},
	{
		id: AttestationMetricIds.AttestationVerified,
		label: "Attestation verifications succeeded",
		type: MetricType.Counter
	},
	{
		id: AttestationMetricIds.AttestationVerificationFailed,
		label: "Attestation verifications failed",
		type: MetricType.Counter
	},
	{
		id: AttestationMetricIds.AttestationTransferred,
		label: "Attestations transferred",
		type: MetricType.Counter
	},
	{
		id: AttestationMetricIds.AttestationDestroyed,
		label: "Attestations destroyed",
		type: MetricType.Counter
	}
];
