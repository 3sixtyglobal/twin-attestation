// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IRestRouteEntryPoint } from "@twin.org/api-models";
import { generateRestRoutesAttestation, tagsAttestation } from "./attestationRoutes.js";

export const restEntryPoints: IRestRouteEntryPoint[] = [
	{
		name: "attestation",
		defaultBaseRoute: "attestation",
		tags: tagsAttestation,
		generateRoutes: generateRestRoutesAttestation
	}
];
