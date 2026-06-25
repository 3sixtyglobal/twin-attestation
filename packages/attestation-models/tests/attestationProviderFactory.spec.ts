// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { AttestationConnectorFactory } from "../src/factories/attestationConnectorFactory.js";
import type { IAttestationConnector } from "../src/models/IAttestationConnector.js";

describe("AttestationConnectorFactory", () => {
	test("can add an item to the factory", async () => {
		AttestationConnectorFactory.register(
			"my-attestation",
			() => ({}) as unknown as IAttestationConnector
		);
	});
});
