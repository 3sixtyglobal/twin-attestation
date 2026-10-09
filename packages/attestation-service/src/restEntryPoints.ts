// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IRestRouteEntryPoint } from "@3sixty/api-models";
import { generateRestRoutesAttestation, tagsAttestation } from "./attestationRoutes.js";

/**
 * The REST entry points for the attestation service.
 */
export const restEntryPoints: IRestRouteEntryPoint[] = [
	{
		name: "attestation",
		defaultBaseRoute: "attestation",
		tags: tagsAttestation,
		generateRoutes: generateRestRoutesAttestation
	}
];
